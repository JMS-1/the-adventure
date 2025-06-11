import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { GameService } from '../services/game.service';
import { EntityAssignments } from './entity-assignments';
import { Person } from './person';
import { Room } from './room';
import { Thing } from './thing';

describe('EntityAssignments', () => {
  let game: GameService;
  let person: Person;
  let thing: Thing;
  let room: Room;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: GameService,
          useValue: {
            objects: { findEntity: (key: string) => ({ name: key, key }) },
            rooms: { rooms: {} },
          },
        },
        {
          provide: Person,
          useValue: { key: 'testP', name: 'testP' },
        },
        {
          provide: Thing,
          useValue: { key: 'testT', name: 'testT' },
        },
        {
          provide: Room,
          useValue: { key: '$$area$testS' },
        },
      ],
    });

    game = TestBed.inject(GameService);
    room = TestBed.inject(Room);
    person = TestBed.inject(Person);
    thing = TestBed.inject(Thing);
  });

  it('can serialize', () => {
    const assigments = new EntityAssignments();

    assigments.set(person, new Set());
    assigments.set(room, new Set());
    assigments.set(thing, new Set([person.key]));

    assigments.add(person, room);
    assigments.add(thing, room);

    expect(assigments.save()).toEqual({
      entities: {
        $$area$testS: ['testP', 'testT'],
        testP: [],
        testT: ['testP'],
      },
    });
  });

  it('can de-serialize', () => {
    const assigments = new EntityAssignments();

    assigments.load(
      {
        entities: {
          $$area$testS: ['testP', 'testT'],
          testP: [],
          testT: ['testP'],
        },
      },
      game
    );

    expect(assigments.save()).toEqual({
      entities: {
        $$area$testS: ['testP', 'testT'],
        testP: [],
        testT: ['testP'],
      },
    });

    expect(Array.from(assigments.children(person))).toEqual([]);
    expect(Array.from(assigments.children(thing))).toEqual([person.name]);
    expect(Array.from(assigments.children(room))).toEqual([
      person.name,
      thing.name,
    ]);

    expect(assigments.has(person, thing)).toBe(false);
    expect(assigments.has(person, person)).toBe(false);

    expect(assigments.has(thing, thing)).toBe(false);
    expect(assigments.has(thing, person)).toBe(true);

    expect(assigments.has(room, thing)).toBe(true);
    expect(assigments.has(room, person)).toBe(true);
  });
});
