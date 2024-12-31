import { Injectable, OnDestroy } from '@angular/core';
import { combineLatest, ReplaySubject, Subject, tap } from 'rxjs';
import { CommandService } from '../commands/command.service';
import { Player } from '../gameObject/player';
import { State } from '../gameObject/state';
import { stateOperations } from '../gameObject/stateOperations';
import { systemMessages } from '../gameObject/systemMessages';
import { Time } from '../gameObject/time';
import { Weight } from '../gameObject/weight';
import { DefaultsService } from './defaults.service';
import { InfoService } from './info.service';
import { MessagesService } from './messages.service';
import { ObjectsService } from './objects.service';
import { StatesService } from './states.service';

@Injectable()
export class GameService implements OnDestroy {
  private readonly _parseDone$ = new ReplaySubject<boolean>(1);

  readonly ready$ = this._parseDone$.asObservable();

  private readonly _output$ = new Subject<
    ['out' | 'debug' | 'error', string]
  >();

  readonly output$ = this._output$.asObservable();

  lastError = '';

  player = new Player(new State('n/a', 'n/a'), null!, null!, null!);

  constructor(
    public readonly commands: CommandService,
    public readonly defaults: DefaultsService,
    public readonly info: InfoService,
    public readonly messages: MessagesService,
    public readonly objects: ObjectsService,
    public readonly states: StatesService
  ) {
    const subscription = combineLatest([
      commands.parseDone$,
      defaults.parseDone$,
      info.parseDone$,
      messages.parseDone$,
      objects.parseDone$,
      states.parseDone$,
    ])
      .pipe(
        tap((errors) => {
          const error = errors.filter((e) => e).join('; ');

          if (error) throw new Error(`parsing error: ${error}`);
        }),
        tap(this.setup)
      )
      .subscribe({
        error: (e) => {
          this.lastError = e.message;

          this._parseDone$.next(true);
        },
        next: () => {
          subscription.unsubscribe();

          this._parseDone$.next(true);
        },
      });
  }

  parse() {
    this.commands.parse();
    this.defaults.parse();
    this.info.parse();
    this.messages.parse();
    this.objects.parse();
    this.states.parse();
  }

  ngOnDestroy(): void {
    this._parseDone$.complete();
    this._output$.complete();
  }

  private readonly setup = (): void => {
    const state = this.states.states[this.defaults.state];

    if (!state)
      throw new Error(`initial state '${this.defaults.state}' not found`);

    this.player = new Player(
      state,
      new Weight(this.defaults.weight),
      new Time(this.defaults.time),
      this
    );

    const objects = [
      ...Object.values(this.objects.thingOrPerson),
      ...Object.values(this.states.states),
    ];

    for (const gameObject of objects) gameObject.loadDefaults(this);

    for (const gameObject of objects) gameObject.validate(this);

    this.output(this.info.intro);

    this.player.state.run(stateOperations.stay, this);
  };

  debug(message: string) {
    this._output$.next(['debug', message]);
  }

  output(message: string) {
    this._output$.next(['out', '\n' + message + '\n']);
  }

  error(key: string) {
    const messages = this.messages.messageMap[key];

    if (!messages?.length) return;

    const choice =
      messages?.[Math.floor(Math.random() * (messages?.length ?? 0))];

    this._output$.next(['error', choice + '\n']);
  }

  run(cmd: string) {
    cmd = cmd.trim();

    if (!cmd) return;

    const thingsAndPersons = [
      ...this.player.Inventory,
      ...this.player.state.things,
      ...this.player.state.persons,
    ].reduce((map, name) => {
      for (const word of this.objects.thingOrPerson[name]?.words || [])
        map[word.toLowerCase()] = name;

      return map;
    }, {} as Record<string, string>);

    for (const command of this.commands.analyseCommand(cmd, thingsAndPersons)) {
      this.debug(`${command[0]} on ${command[1]}`);

      return;
    }

    this.debug('unknown command');

    this.error(`system.${systemMessages.NoComm}`);
  }
}
