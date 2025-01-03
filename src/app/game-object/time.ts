/** '(' 'd' <0..6> '/' <0..99> ',' 'h' <0..99> '/' <0..23> ',' 'm' <0..59> '/' <0..99> ')' */
const timeReg =
  /^\(\s*d(\d{1,2})\/(\d{1,2})\s*,\s*h(\d{1,2})\/(\d{1,2})\s*,\s*m(\d{1,2})\/(\d{1,2})\s*\)$/;

/** Limits of each time element - 7 week days, 24 hours each day, 60 minutes each hour. */
const ranges = [7, 24, 60];

/** Represents the game time as weekday, hour of day and minute of hour. */
export class Time {
  /** Current time. */
  private readonly _times: number[];

  /** Time advance. */
  private readonly _deltas: number[];

  /** Report day of week. */
  get dayOfWeek() {
    return this._times[0];
  }

  /** Report hour of day. */
  get hours() {
    return this._times[1];
  }

  /** Report minute of hour. */
  get minutes() {
    return this._times[2];
  }

  /**
   * Create a new time representation.
   *
   * @param time well formatted string or another time to be cloned.
   */
  constructor(time: string | Time) {
    if (time instanceof Time) {
      this._times = [...time._times];
      this._deltas = [...time._deltas];
    } else {
      const match = timeReg.exec(time);

      if (!match) throw new Error(`invalid time ${time}`);

      this._times = [
        parseInt(match[1]),
        parseInt(match[3]),
        parseInt(match[5]),
      ];
      this._deltas = [
        parseInt(match[2]),
        parseInt(match[4]),
        parseInt(match[6]),
      ];

      if (this._times[0] >= ranges[0]) throw new Error('bad weekday');
      if (this._times[1] >= ranges[1]) throw new Error('hour over 24');
      if (this._times[2] >= ranges[2]) throw new Error('minute over 59');

      if (this._deltas.every((d) => !d)) throw new Error('no time advance');
    }
  }

  /** Add the time deltas to the current time. */
  increment() {
    for (let i = Math.max(this._times.length, this._deltas.length); i-- > 0; ) {
      /** Simple advance. */
      const time = this._times[i] + this._deltas[i];

      /** Clip to related limit. */
      this._times[i] = time % ranges[i];

      /** Carry over to next higher granularity - weekday will just move on. */
      if (i > 0) this._times[i - 1] += Math.floor(time / ranges[i]);
    }
  }

  /** Helper for debugging purpuses. */
  toString() {
    return JSON.stringify(this._times);
  }

  /** Create a JSON representation. */
  save() {
    return { times: this._times, deltas: this._deltas };
  }

  /**
   * Reconstruct from the JSON representation.
   *
   * @param serialize as reconstructed by parsing the result from a call to save.
   * @returns a new time instance according to the JSON representation.
   */
  static load(serialize: unknown) {
    const time = new Time('(d0/0,h0/0,m0/1)');
    const json = serialize as ReturnType<Time['save']>;

    time._times.splice(0, time._times.length, ...json.times);
    time._deltas.splice(0, time._deltas.length, ...json.deltas);

    return time;
  }
}
