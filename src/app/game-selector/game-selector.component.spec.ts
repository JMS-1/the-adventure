import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SettingsService } from '../services/settings.service';
import { GameSelectorComponent } from './game-selector.component';

describe('GameSelectorComponent', () => {
  let component: GameSelectorComponent;
  let fixture: ComponentFixture<GameSelectorComponent>;

  beforeEach(async () => {
    TestBed.overrideComponent(GameSelectorComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
    });

    await TestBed.configureTestingModule({
      imports: [GameSelectorComponent, NoopAnimationsModule],
      providers: [{ provide: SettingsService, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(GameSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
