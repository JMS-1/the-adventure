import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { of } from 'rxjs';
import { CommandService } from '../commands/command.service';
import { DefaultsService } from './defaults.service';
import { GameService } from './game.service';
import { InfoService } from './info.service';
import { MessagesService } from './messages.service';
import { ObjectsService } from './objects.service';
import { RoomsService } from './rooms.service';
import { SettingsService } from './settings.service';

describe('GameService', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GameService,
        { provide: CommandService, useValue: { parseDone$: of() } },
        { provide: DefaultsService, useValue: { parseDone$: of() } },
        { provide: InfoService, useValue: { parseDone$: of() } },
        { provide: MessagesService, useValue: { parseDone$: of() } },
        { provide: ObjectsService, useValue: { parseDone$: of() } },
        { provide: SettingsService, useValue: {} },
        { provide: RoomsService, useValue: { parseDone$: of() } },
      ],
    });
    service = TestBed.inject(GameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
