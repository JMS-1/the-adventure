import { Injectable, OnDestroy } from '@angular/core';
import { combineLatest, ReplaySubject } from 'rxjs';
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

  constructor(
    public readonly defaults: DefaultsService,
    public readonly messages: MessagesService,
    public readonly objects: ObjectsService,
    public readonly states: StatesService,
    public readonly words: WordsService
  ) {
    combineLatest([
      defaults.parseDone$,
      messages.parseDone$,
      objects.parseDone$,
      states.parseDone$,
      words.parseDone$,
    ]).subscribe(([defError, msgError, objError, stateError, wordError]) => {
      this.lastError = [defError, msgError, objError, stateError, wordError]
        .filter((e) => e)
        .join('; ');

      this._parseDone$.next(true);
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
}
