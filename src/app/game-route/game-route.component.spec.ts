import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { CommonModule } from '@angular/common';
import * as core from '@angular/core';
import { of } from 'rxjs';
import { Player } from '../game-object/player';
import { Room } from '../game-object/room';
import { Time } from '../game-object/time';
import { Weight } from '../game-object/weight';
import { GameService } from '../services/game.service';
import { SettingsService } from '../services/settings.service';
import { GameRouteComponent } from './game-route.component';

describe('GameRouteComponent', () => {
  let component: GameRouteComponent;
  let fixture: ComponentFixture<GameRouteComponent>;

  beforeEach(async () => {
    TestBed.overrideComponent(GameRouteComponent, {
      set: {
        imports: [CommonModule],
        providers: [],
        schemas: [core.NO_ERRORS_SCHEMA],
      },
    });

    await TestBed.configureTestingModule({
      imports: [GameRouteComponent],
      providers: [
        { provide: SettingsService, useValue: {} },
        {
          provide: GameService,
          useValue: {
            parse: () => {
              /* */
            },
            output$: of(),
            player: new Player(
              new Room('n/a', 'n/a'),
              new Weight('(0,0,0)'),
              new Time('(d0/0,h0/0,m0/1)'),
              null!
            ),
          },
        },
      ],
    }).compileComponents();

    await core.ɵresolveComponentResources(fetch);

    fixture = TestBed.createComponent(GameRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
