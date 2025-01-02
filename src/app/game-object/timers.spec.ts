import { TestBed } from '@angular/core/testing';

import { GameService } from '../services/game.service';
import { Person } from './person';
import { Thing } from './thing';
import { Timers } from './timers';

describe('Timers', () => {
  let game: GameService;
  let person: Person;
  let thing: Thing;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: GameService,
          useValue: {
            debug: (e: unknown) => console.log(e),
            objects: { findEntity: (name: string) => ({ name }) },
          },
        },
        {
          provide: Person,
          useValue: { name: 'testP', times: { '10': [] } },
        },
        {
          provide: Thing,
          useValue: { name: 'testT', times: { '+5': [] } },
        },
      ],
    });

    game = TestBed.inject(GameService);
    person = TestBed.inject(Person);
    thing = TestBed.inject(Thing);
  });

  it('can serialize', () => {
    const timers = new Timers();

    timers.start(person, game);
    timers.start(thing, game);

    expect(timers.save()).toEqual({
      timers: [
        { at: 10, entity: 'testP', key: '10', once: true },
        { at: 5, entity: 'testT', key: '+5', once: false },
      ],
    });
  });

  it('can de-serialize', () => {
    const timers = Timers.load(
      {
        timers: [
          { at: 10, entity: 'testP', key: '10', once: true },
          { at: 5, entity: 'testT', key: '+5', once: false },
        ],
      },
      game
    );

    expect(timers.save()).toEqual({
      timers: [
        { at: 10, entity: 'testP', key: '10', once: true },
        { at: 5, entity: 'testT', key: '+5', once: false },
      ],
    });
  });
});
