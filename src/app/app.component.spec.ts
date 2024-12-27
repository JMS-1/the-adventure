import { AsyncPipe, JsonPipe } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { DefaultsService } from './services/defaults.service';
import { MessagesService } from './services/messages.service';
import { ObjectsService } from './services/objects.service';
import { StatesService } from './services/states.service';
import { WordsService } from './services/words.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    TestBed.overrideComponent(AppComponent, {
      set: {
        imports: [AsyncPipe, JsonPipe],
        providers: [],
        schemas: [NO_ERRORS_SCHEMA],
      },
    });

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: DefaultsService, useValue: {} },
        { provide: MessagesService, useValue: {} },
        { provide: ObjectsService, useValue: {} },
        { provide: StatesService, useValue: {} },
        { provide: WordsService, useValue: {} },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
