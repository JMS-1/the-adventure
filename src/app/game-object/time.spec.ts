import { Time } from './time';

describe('Time', () => {
  it('can increment without overflow', () => {
    const time = new Time('(d1/0,h12/0,m42/4)');

    expect(time.dayOfWeek).toBe(1);
    expect(time.hours).toBe(12);
    expect(time.minutes).toBe(42);

    time.increment();

    expect(time.dayOfWeek).toBe(1);
    expect(time.hours).toBe(12);
    expect(time.minutes).toBe(46);
  });

  it('can increment with overflow', () => {
    const time = new Time('(d6/0,h22/1,m52/7)');

    expect(time.dayOfWeek).toBe(6);
    expect(time.hours).toBe(22);
    expect(time.minutes).toBe(52);

    time.increment();

    expect(time.dayOfWeek).toBe(6);
    expect(time.hours).toBe(23);
    expect(time.minutes).toBe(59);

    time.increment();

    expect(time.dayOfWeek).toBe(0);
    expect(time.hours).toBe(1);
    expect(time.minutes).toBe(6);
  });

  it('can serialize', () => {
    const time = new Time('(d6/0,h22/1,m52/7)');

    expect(time.save()).toEqual({
      times: [6, 22, 52],
      deltas: [0, 1, 7],
    });
  });

  it('can de-serialize', () => {
    const time = Time.load({ times: [6, 22, 52], deltas: [0, 1, 7] });

    expect(time.save()).toEqual({
      times: [6, 22, 52],
      deltas: [0, 1, 7],
    });
  });
});
