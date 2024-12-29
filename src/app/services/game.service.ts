import { Injectable, OnDestroy } from '@angular/core';
import { combineLatest, ReplaySubject, Subject, tap } from 'rxjs';
import { Player } from '../gameObject/player';
import { stateOperations } from '../gameObject/stateOperations';
import { Time } from '../gameObject/time';
import { Weight } from '../gameObject/weight';
import { DefaultsService } from './defaults.service';
import { InfoService } from './info.service';
import { MessagesService } from './messages.service';
import { ObjectsService } from './objects.service';
import { StatesService } from './states.service';
import { WordsService } from './words.service';

@Injectable()
export class GameService implements OnDestroy {
  private readonly _parseDone$ = new ReplaySubject<boolean>(1);

  readonly ready$ = this._parseDone$.asObservable();

  private readonly _output$ = new Subject<string>();

  readonly output$ = this._output$.asObservable();

  lastError = '';

  player?: Player;

  constructor(
    public readonly info: InfoService,
    public readonly defaults: DefaultsService,
    public readonly messages: MessagesService,
    public readonly objects: ObjectsService,
    public readonly states: StatesService,
    public readonly words: WordsService
  ) {
    const subscription = combineLatest([
      defaults.parseDone$,
      messages.parseDone$,
      objects.parseDone$,
      states.parseDone$,
      words.parseDone$,
      info.parseDone$,
    ])
      .pipe(
        tap(([defError, msgError, objError, stateError, wordError, info]) => {
          const error = [
            defError,
            msgError,
            objError,
            stateError,
            wordError,
            info,
          ]
            .filter((e) => e)
            .join('; ');

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
    this.defaults.parse();
    this.info.parse();
    this.messages.parse();
    this.objects.parse();
    this.states.parse();
    this.words.parse();
  }

  ngOnDestroy(): void {
    this._parseDone$.complete();
    this._output$.complete();
  }

  private readonly setup = (): void => {
    const objects = [
      ...Object.values(this.objects.persons),
      ...Object.values(this.objects.things),
      ...Object.values(this.states.states),
    ];

    for (const gameObject of objects) gameObject.loadDefaults(this);

    for (const gameObject of objects) gameObject.validate(this);

    const state = this.states.states[this.defaults.state];

    if (!state)
      throw new Error(`initial state '${this.defaults.state}' not found`);

    this.player = new Player(
      state,
      new Weight(this.defaults.weight),
      new Time(this.defaults.time)
    );

    this._output$.next(this.info.intro);

    this.player.state.run(stateOperations.stay, this);
  };
}
