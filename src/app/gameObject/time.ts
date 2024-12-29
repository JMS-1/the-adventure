const timeReg =
  /^\(\s*d(\d{1,2})\/(\d{1,2})\s*,\s*h(\d{1,2})\/(\d{1,2})\s*,\s*m(\d{1,2})\/(\d{1,2})\s*\)$/;

const ranges = [7, 24, 60];

export class Time {
  private readonly _times: number[];

  private readonly _deltas: number[];

  get dayOfWeek() {
    return this._times[0];
  }

  get hours() {
    return this._times[1];
  }

  get minutes() {
    return this._times[2];
  }

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

  increment() {
    for (let i = Math.max(this._times.length, this._deltas.length); i-- > 0; ) {
      const time = this._times[i] + this._deltas[i];

      this._times[i] = time % ranges[i];

      if (i > 0) this._times[i - 1] += Math.floor(time / ranges[i]);
    }
  }

  toString() {
    return JSON.stringify(this._times);
  }
}
