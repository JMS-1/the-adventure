const weightReg = /^\(\s*(\d{1,4})\s*,\s*(\d{1,4})\s*,\s*(\d{1,4})\s*\)$/;

export class Weight {
  private readonly _weights: number[];

  constructor(weight: string | Weight) {
    if (weight instanceof Weight) {
      this._weights = [...weight._weights];
    } else {
      const match = weightReg.exec(weight);

      if (!match) throw new Error(`invalid weight ${weight}`);

      this._weights = [
        parseInt(match[1]),
        parseInt(match[2]),
        parseInt(match[3]),
      ];
    }
  }

  toString() {
    return JSON.stringify(this._weights);
  }

  subtract(weight: Weight) {
    const weights = [
      this._weights[0] - weight._weights[0],
      this._weights[1] - weight._weights[1],
      this._weights[2] - weight._weights[2],
    ];

    if (weights.some((w) => w < 0)) return false;

    this._weights[0] = weights[0];
    this._weights[1] = weights[1];
    this._weights[2] = weights[2];

    return true;
  }

  add(weight: Weight) {
    this._weights[0] = this._weights[0] + weight._weights[0];
    this._weights[1] = this._weights[1] + weight._weights[1];
    this._weights[2] = this._weights[2] + weight._weights[2];
  }

  save() {
    return { weights: this._weights };
  }

  static load(serialize: unknown) {
    const weight = new Weight('(0,0,0)');
    const json = serialize as ReturnType<Weight['save']>;

    weight._weights.splice(0, weight._weights.length, ...json.weights);

    return weight;
  }
}
