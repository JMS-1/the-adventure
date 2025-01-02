import { TestBed } from '@angular/core/testing';

import { EntityAssignments } from './entity-assignments';
import { Person } from './person';
import { State } from './state';
import { Thing } from './thing';

describe('EntityAssignments', () => {
  let person: Person;
  let thing: Thing;
  let state: State;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Person,
          useValue: { key: 'testP', name: 'testP' },
        },
        {
          provide: Thing,
          useValue: { key: 'testT', name: 'testT' },
        },
        {
          provide: State,
          useValue: { key: '$$area$testS' },
        },
      ],
    });

    state = TestBed.inject(State);
    person = TestBed.inject(Person);
    thing = TestBed.inject(Thing);
  });

  it('can serialize', () => {
    const assigments = new EntityAssignments();

    assigments.set(person, new Set());
    assigments.set(state, new Set());
    assigments.set(thing, new Set([person.key]));

    assigments.add(person, state);
    assigments.add(thing, state);

    expect(assigments.save()).toEqual({
      entities: {
        $$area$testS: ['testP', 'testT'],
        testP: [],
        testT: ['testP'],
      },
    });
  });

  it('can de-serialize', () => {
    const assigments = EntityAssignments.load({
      entities: {
        $$area$testS: ['testP', 'testT'],
        testP: [],
        testT: ['testP'],
      },
    });

    expect(assigments.save()).toEqual({
      entities: {
        $$area$testS: ['testP', 'testT'],
        testP: [],
        testT: ['testP'],
      },
    });

    expect(Array.from(assigments.children(person))).toEqual([]);
    expect(Array.from(assigments.children(thing))).toEqual([person.name]);
    expect(Array.from(assigments.children(state))).toEqual([
      person.name,
      thing.name,
    ]);

    expect(assigments.has(person, thing)).toBeFalse();
    expect(assigments.has(person, person)).toBeFalse();

    expect(assigments.has(thing, thing)).toBeFalse();
    expect(assigments.has(thing, person)).toBeTrue();

    expect(assigments.has(state, thing)).toBeTrue();
    expect(assigments.has(state, person)).toBeTrue();
  });
});
