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
  }
}
