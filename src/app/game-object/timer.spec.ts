import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { Action } from '../actions';
import { GameService } from '../services/game.service';
import { Person } from './person';
import { Timer } from './timer';

class SomeAction extends Action {
  executed = false;

  override validate(): void {
    throw new Error('validate not implemented.');
  }

  protected override onRun() {
    this.executed = true;

    return true;
  }
}

describe('Timer', () => {
  let action: SomeAction;

  let game: GameService;
  let person: Person;

  beforeEach(() => {
    action = new SomeAction();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: GameService,
          useValue: {
            debug: (e: unknown) => console.log(e),
            objects: { findEntity: (name: string) => ({ name }) },
            player: { dead: false },
          },
        },
        {
          provide: Person,
          useValue: { name: 'test', times: { '10': [action], '+5': [action] } },
        },
      ],
    });

    game = TestBed.inject(GameService);
    person = TestBed.inject(Person);
  });

  it('action is initially not executed', () => {
    expect(action.executed).toBe(false);
  });

  it('can execute one-shot action', () => {
    const timer = new Timer(person, 10, true, '10');

    for (let i = 9; i-- > 0; ) {
      timer.nextTick(game);

      expect(action.executed).toBe(false);
    }

    timer.nextTick(game);

    expect(action.executed).toBe(true);

    action.executed = false;

    for (let i = 100; i-- > 0; ) {
      timer.nextTick(game);

      expect(action.executed).toBe(false);
    }
  });

  it('can execute interval action', () => {
    const timer = new Timer(person, 5, false, '+5');

    for (let j = 10; j-- > 0; ) {
      for (let i = 4; i-- > 0; ) {
        timer.nextTick(game);

        expect(action.executed).toBe(false);
      }

      timer.nextTick(game);

      expect(action.executed).toBe(true);

      action.executed = false;
    }
  });

  it('can serialize', () => {
    const timer = new Timer(person, 5, false, '+5');

    expect(timer.save()).toEqual({
      at: 5,
      entity: 'test',
      key: '+5',
      next: 5,
      once: false,
    });
  });

  it('can de-serialize', () => {
    const timer = Timer.load(
      { at: 10, entity: 'test2', key: '10', next: 10, once: true },
      game
    );

    expect(timer.save()).toEqual({
      at: 10,
      entity: 'test2',
      key: '10',
      next: 10,
      once: true,
    });
  });
});
