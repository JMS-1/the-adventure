import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { GameService } from '../services/game.service';
import { SettingsService } from '../services/settings.service';
import { GameRouteComponent } from './game-route.component';

describe('GameRouteComponent', () => {
  let component: GameRouteComponent;
  let fixture: ComponentFixture<GameRouteComponent>;

  beforeEach(async () => {
    TestBed.overrideComponent(GameRouteComponent, {
      set: { imports: [CommonModule], providers: [] },
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
            player: {
              state: { key: 'test' },
              Inventory: new Set(),
              CarriedObjects: { test: new Set() },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
