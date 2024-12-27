import { Injectable, OnDestroy } from '@angular/core';
import { combineLatest, ReplaySubject } from 'rxjs';
import { DefaultsService } from './defaults.service';
import { MessagesService } from './messages.service';
import { ObjectsService } from './objects.service';
import { StatesService } from './states.service';
import { WordsService } from './words.service';

@Injectable()
export class GameService implements OnDestroy {
  private readonly _parseDone$ = new ReplaySubject<void>(1);

  readonly ready$ = this._parseDone$.asObservable();

  lastError = '';

  constructor(
    private readonly _defaults: DefaultsService,
    private readonly _messages: MessagesService,
    private readonly _objects: ObjectsService,
    private readonly _states: StatesService,
    private readonly _words: WordsService
  ) {
    combineLatest([
      _defaults.parseDone$,
      _messages.parseDone$,
      _objects.parseDone$,
      _states.parseDone$,
      _words.parseDone$,
    ]).subscribe(([defError, msgError, objError, stateError, wordError]) => {
      this.lastError = [defError, msgError, objError, stateError, wordError]
        .filter((e) => e)
        .join('; ');

      this._parseDone$.complete();
    });
  }

  parse() {
    this._defaults.parse();
    this._messages.parse();
    this._objects.parse();
    this._states.parse();
    this._words.parse();
  }

  ngOnDestroy(): void {
    this._parseDone$.complete();
  }
}
