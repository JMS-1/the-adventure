import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ɵresolveComponentResources as resolve } from '@angular/core';

import { GameService } from '../../services/game.service';
import { LoadSelectorComponent } from './load-selector.component';

describe('LoadSelectorComponent', () => {
  let component: LoadSelectorComponent;
  let fixture: ComponentFixture<LoadSelectorComponent>;

  beforeEach(async () => {
    TestBed.overrideComponent(LoadSelectorComponent, { set: { inputs: [] } });

    await TestBed.configureTestingModule({
      imports: [LoadSelectorComponent],
      providers: [
        { provide: GameService, useValue: { currentSavedStates: [] } },
      ],
    }).compileComponents();

    await resolve(fetch);

    fixture = TestBed.createComponent(LoadSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
