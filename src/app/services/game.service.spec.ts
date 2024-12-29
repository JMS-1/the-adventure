import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';
import { DefaultsService } from './defaults.service';
import { GameService } from './game.service';
import { InfoService } from './info.service';
import { MessagesService } from './messages.service';
import { ObjectsService } from './objects.service';
import { StatesService } from './states.service';
import { WordsService } from './words.service';

describe('GameService', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GameService,
        { provide: DefaultsService, useValue: { parseDone$: of() } },
        { provide: InfoService, useValue: { parseDone$: of() } },
        { provide: MessagesService, useValue: { parseDone$: of() } },
        { provide: ObjectsService, useValue: { parseDone$: of() } },
        { provide: StatesService, useValue: { parseDone$: of() } },
        { provide: WordsService, useValue: { parseDone$: of() } },
      ],
    });
    service = TestBed.inject(GameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});