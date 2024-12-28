const weightReg = /^\(\s*(\d{1,4})\s*,\s*(\d{1,4})\s*,\s*(\d{1,4})\s*\)$/;

export class Weight {
  readonly weights: number[];

  constructor(weight: string) {
    const match = weightReg.exec(weight);

    if (!match) throw new Error(`invalid weight ${weight}`);

    this.weights = [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  }
}
