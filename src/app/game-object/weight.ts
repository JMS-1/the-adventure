const weightReg = /^\(\s*(\d{1,4})\s*,\s*(\d{1,4})\s*,\s*(\d{1,4})\s*\)$/;

export class Weight {
  readonly weights: number[];

  constructor(weight: string | Weight) {
    if (weight instanceof Weight) {
      this.weights = [...weight.weights];
    } else {
      const match = weightReg.exec(weight);

      if (!match) throw new Error(`invalid weight ${weight}`);

      this.weights = [
        parseInt(match[1]),
        parseInt(match[2]),
        parseInt(match[3]),
      ];
    }
  }

  toString() {
    return JSON.stringify(this.weights);
  }

  subtract(weight: Weight) {
    const weights = [
      this.weights[0] - weight.weights[0],
      this.weights[1] - weight.weights[1],
      this.weights[2] - weight.weights[2],
    ];

    if (weights.some((w) => w < 0)) return false;

    this.weights[0] = weights[0];
    this.weights[1] = weights[1];
    this.weights[2] = weights[2];

    return true;
  }

  add(weight: Weight) {
    this.weights[0] = this.weights[0] + weight.weights[0];
    this.weights[1] = this.weights[1] + weight.weights[1];
    this.weights[2] = this.weights[2] + weight.weights[2];
  }
}
