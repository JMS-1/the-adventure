import { describe, expect, it } from 'vitest';
import { ActionCounters } from './counters';

describe('ActionCounters', () => {
  it('can test counter', () => {
    const counters = new ActionCounters();

    const test = [3, 4, 2];

    expect(counters.allowAction('one', test)).toBe(false);

    const expected = [
      false,
      false,
      true,
      false,
      false,
      false,
      true,
      false,
      true,
      false,
      true,
      false,
      true,
    ];

    for (const allow of expected) {
      counters.incrementActionCounter('one');

      expect(counters.allowAction('one', test)).toBe(allow);
    }
  });

  it('can serialize', () => {
    const counters = new ActionCounters();

    counters.incrementActionCounter('one');
    counters.incrementActionCounter('two');
    counters.incrementActionCounter('one');
    counters.incrementActionCounter('three');
    counters.resetActionCounter('three');

    expect(counters.save()).toEqual({
      counters: {
        one: 2,
        two: 1,
      },
    });
  });

  it('can de-serialize', () => {
    const counters = new ActionCounters();

    counters.load({
      counters: {
        three: 12,
        one: 2,
        two: 1,
      },
    });

    expect(counters.save()).toEqual({
      counters: {
        three: 12,
        one: 2,
        two: 1,
      },
    });
  });
});
