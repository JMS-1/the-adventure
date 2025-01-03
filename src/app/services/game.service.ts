import { Injectable, OnDestroy } from '@angular/core';
import { combineLatest, ReplaySubject, Subject, tap } from 'rxjs';
import { Action } from '../actions';
import { CommandService } from '../commands/command.service';
import { Entity } from '../game-object/entity';
import { systemMessages } from '../game-object/messages';
import { stateOperations } from '../game-object/operations';
import { Player } from '../game-object/player';
import { systemShortcuts } from '../game-object/shortcuts';
import { State } from '../game-object/state';
import { Time } from '../game-object/time';
import { Weight } from '../game-object/weight';
import { DefaultsService } from './defaults.service';
import { InfoService } from './info.service';
import { MessagesService } from './messages.service';
import { ObjectsService } from './objects.service';
import { SettingsService } from './settings.service';
import { StatesService } from './states.service';

const days: systemMessages[] = [
  systemMessages.Day0,
  systemMessages.Day1,
  systemMessages.Day2,
  systemMessages.Day3,
  systemMessages.Day4,
  systemMessages.Day5,
  systemMessages.Day6,
];

const storageKeyPrefix = 'W3ADV.';

@Injectable()
export class GameService implements OnDestroy {
  private readonly _parseDone$ = new ReplaySubject<boolean>(1);

  readonly ready$ = this._parseDone$.asObservable();

  private readonly _output$ = new Subject<
    ['out' | 'debug' | 'error' | 'verbatim', string]
  >();

  readonly output$ = this._output$.asObservable();

  private _suppressOutput = 0;

  lastError = '';

  player = new Player(
    new State('n/a', 'n/a'),
    new Weight('(0,0,0)'),
    new Time('(d0/0,h0/0,m0/1)'),
    null!
  );

  constructor(
    public readonly commands: CommandService,
    public readonly defaults: DefaultsService,
    public readonly info: InfoService,
    public readonly messages: MessagesService,
    public readonly objects: ObjectsService,
    public readonly states: StatesService,
    public readonly settings: SettingsService
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
      ...Object.values(this.objects.entities),
      ...Object.values(this.states.states),
    ];

    for (const gameObject of objects) gameObject.loadDefaults(this);

    for (const gameObject of objects) gameObject.validate(this);

    this.verbatim(this.info.intro);

    this.execute(() => this.player.state.run(stateOperations.stay, this), true);

    this.dumpCurrentState();
  };

  private verbatim(message: string) {
    this._output$.next(['verbatim', message]);
  }

  help() {
    this.verbatim(this.info.help);
  }

  debug(message: string) {
    this._output$.next(['debug', message]);
  }

  private getMessage(message: systemMessages) {
    const messages = this.messages.messageMap[`${message}`];

    return messages?.[Math.floor(Math.random() * messages?.length)] || message;
  }

  output(message: string | string[], force = true) {
    if (this._suppressOutput > 0 && !force) return;

    if (Array.isArray(message))
      message = message[Math.floor(Math.random() * message.length)];
    else message = `${message}`;

    this._output$.next(['out', '\n' + message]);
  }

  error(key: string | systemMessages) {
    const messages = this.messages.messageMap[`${key}`];

    if (!messages?.length) return;

    const choice =
      messages?.[Math.floor(Math.random() * (messages?.length ?? 0))];

    this._output$.next(['error', choice + '\n']);
  }

  run(cmd: string): void {
    cmd = cmd.trim();

    if (!cmd) return;

    const thingsAndPersons = this.player.entities.reduce((map, name) => {
      for (const word of this.objects.entities[name].words)
        map[word.toLowerCase()] = name;

      return map;
    }, {} as Record<string, string>);

    const state = this.player.state;
    const dead = this.player.dead;

    try {
      try {
        for (const [command, entity] of this.commands.analyseCommand(
          cmd,
          thingsAndPersons
        )) {
          const shortcut = this.defaults.keyMap[command || '*'];

          if (entity) {
            const scope = this.objects.findEntity(entity);

            switch (shortcut) {
              case systemShortcuts.Drop:
                return this.dropEntity(scope);
              case systemShortcuts.Pick:
                return this.pickEntity(scope);
              default:
                this.debug(`${command} on ${scope.key}`);

                return scope.runCommand(command, this);
            }
          }

          switch (shortcut) {
            case systemShortcuts.Clock:
              return this.dumpTime();
            case systemShortcuts.Quit:
              this.settings.game = undefined;

              return;
            case systemShortcuts.View:
              this.dumpCurrentState();

              return this.dumpInventory();
            case systemShortcuts.Look:
              return this.dumpCurrentState();
            case systemShortcuts.Say: {
              this.debug(`say something`);

              for (const key of this.player.carriedObjects.children(
                this.player.state
              )) {
                const entity = this.objects.entities[key];
                const actions = entity.commands[command];

                if (actions?.length) return Action.run(actions, entity, this);
              }

              return Action.run(this.defaults.commands[command], null!, this);
            }
            default: {
              this.debug(`use exit ${shortcut} on ${state.key}`);

              const exit = state.exits[shortcut] || state.exits['*'] || [];

              return Action.run(exit, state, this);
            }
          }
        }

        this.debug('unknown command');

        this.error(systemMessages.NoComm);
      } finally {
        if (!this.player.dead && this.player.state === state)
          state.run(stateOperations.stay, this);

        if (!this.player.dead) this.player.nextTick();
        else if (!dead) this.verbatim(this.info.extro);
      }
    } catch (e) {
      this.debug(`${e}`);
    }
  }

  dumpCurrentState(debug = true): void {
    const { player } = this;
    const { state } = player;

    if (debug) this.debug(`show state ${state.key}`);

    const exits = state.exits[systemShortcuts.Look.toString()];

    if (exits?.length) Action.run(exits, state, this);
    else player.print(state);

    for (const entity of player.carriedObjects.children(player.state))
      player.print(entity);
  }

  dumpInventory(debug = true): void {
    const { player } = this;

    if (debug)
      this.debug(
        `view inventory ${JSON.stringify(Array.from(this.player.inventory))}`
      );

    for (const entity of player.inventory) player.print(entity);
  }

  private dumpTime(): void {
    this.debug(`show clock ${this.player.time}`);

    const { hours, minutes } = this.player.time;

    this.output(
      this.getMessage(systemMessages.Clock1) +
        ' ' +
        this.getMessage(days[this.player.time.dayOfWeek]) +
        ' ' +
        `${`${hours}`.padStart(2, '0')}` +
        ':' +
        `${`${minutes}`.padStart(2, '0')}` +
        ' ' +
        this.getMessage(systemMessages.Clock2)
    );
  }

  pickEntity(entity: Entity, debug = true): void {
    if (this.player.inventory.has(entity.key)) return;

    if (debug) this.debug(`pick ${entity.key}`);

    this.player.pickEntity(entity);

    entity.runSystemCommand(systemShortcuts.Pick, this);
  }

  dropEntity(entity: Entity, debug = true): void {
    if (!this.player.inventory.has(entity.key)) return;

    if (debug) this.debug(`drop ${entity.key}`);

    this.player.addEntityToParent(entity, this.player.state);

    entity.runSystemCommand(systemShortcuts.Drop, this);
  }

  private get storageKey() {
    return `${storageKeyPrefix}.${this.settings.game}.state`;
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.player.save()));
  }

  load() {
    try {
      const json = localStorage.getItem(this.storageKey);

      if (!json) return false;

      this.player = Player.load(JSON.parse(json), this);

      return true;
    } catch (e) {
      this.lastError = (e as Error).message;

      return false;
    }
  }

  execute(action: () => void, silent: boolean) {
    if (!silent) return action();

    this._suppressOutput++;

    try {
      return action();
    } finally {
      this._suppressOutput--;
    }
  }
}
