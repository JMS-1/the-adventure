import { Injectable, OnDestroy } from '@angular/core';
import { combineLatest, ReplaySubject, tap } from 'rxjs';
import { State } from '../gameObject/state';
import { DefaultsService } from './defaults.service';
import { MessagesService } from './messages.service';
import { ObjectsService } from './objects.service';
import { StatesService } from './states.service';
import { WordsService } from './words.service';

@Injectable()
export class GameService implements OnDestroy {
  private readonly _parseDone$ = new ReplaySubject<boolean>(1);

  readonly ready$ = this._parseDone$.asObservable();

  lastError = '';

  state?: State;

  constructor(
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
    ])
      .pipe(
        tap(([defError, msgError, objError, stateError, wordError]) => {
          const error = [defError, msgError, objError, stateError, wordError]
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
    this.messages.parse();
    this.objects.parse();
    this.states.parse();
    this.words.parse();
  }

  ngOnDestroy(): void {
    this._parseDone$.complete();
  }

  private readonly setup = (): void => {
    for (const person of Object.values(this.objects.persons))
      person.validate(this);

    for (const thing of Object.values(this.objects.things))
      thing.validate(this);

    for (const state of Object.values(this.states.states)) state.validate(this);

    this.state = this.states.states[this.defaults.state];

    if (!this.state)
      throw new Error(`initial state '${this.defaults.state}' not found`);
  };
}
