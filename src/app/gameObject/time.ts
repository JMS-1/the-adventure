const timeReg =
  /^\(\s*d(\d{1,2})\/(\d{1,2})\s*,\s*h(\d{1,2})\/(\d{1,2})\s*,\s*m(\d{1,2})\/(\d{1,2})\s*\)$/;

export class Time {
  readonly times: number[];

  readonly deltas: number[];

  constructor(time: string) {
    const match = timeReg.exec(time);

    if (!match) throw new Error(`invalid time ${time}`);

    this.times = [parseInt(match[1]), parseInt(match[3]), parseInt(match[5])];
    this.deltas = [parseInt(match[2]), parseInt(match[4]), parseInt(match[6])];

    if (this.times[0] > 6) throw new Error('bad weekday');
    if (this.times[1] > 23) throw new Error('hour over 24');
    if (this.times[2] > 59) throw new Error('minute over 59');

    if (this.deltas.every((d) => !d)) throw new Error('no time advance');
  }
}
