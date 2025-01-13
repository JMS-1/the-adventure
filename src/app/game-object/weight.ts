/** '(' <0...9999> ',' <0...9999> ',' <0...9999> ')' */
const weightReg = /^\(\s*(\d{1,4})\s*,\s*(\d{1,4})\s*,\s*(\d{1,4})\s*\)$/;

/** Represents a weight consiting of three independant numbers. */
export class Weight {
  /** Weight parts. */
  private readonly _weights: number[];

  /**
   * Create a new weight.
   *
   * @param weight either the text reprensation or another weight to clone as is.
   */
  constructor(weight: string | Weight) {
    if (weight instanceof Weight) {
      this._weights = [...weight._weights];
    } else {
      /** If given the string representation do some validations. */
      const match = weightReg.exec(weight);

      if (!match) throw new Error(`invalid weight ${weight}`);

      this._weights = [
        parseInt(match[1]),
        parseInt(match[2]),
        parseInt(match[3]),
      ];
    }
  }

  /** Helper just for debug purposes. */
  toString() {
    return JSON.stringify(this._weights);
  }

  /**
   * See if this weight is smaller than another.
   *
   * @param weight wome other weight.
   * @returns set if this weight is smaller than the parameter.
   */
  isLessThan(weight: Weight) {
    for (let i = this._weights.length; i-- > 0; )
      if (this._weights[i] < weight._weights[i]) return true;

    return false;
  }

  /**
   * Add another weight to this - normally as the counterpart
   * to a call to substract.
   *
   * @param weight weigth to add to this one.
   */
  add(weight: Weight) {
    this._weights[0] = this._weights[0] + weight._weights[0];
    this._weights[1] = this._weights[1] + weight._weights[1];
    this._weights[2] = this._weights[2] + weight._weights[2];
  }

  /** Create a JSON represenation. */
  save() {
    return { weights: this._weights };
  }

  /**
   * Recostruct from the JSON representiation created with a
   * call to save.
   *
   * @param serialize the JSON representation from save.
   * @returns a new weight instance.
   */
  static load(serialize: unknown) {
    const weight = new Weight('(0,0,0)');
    const json = serialize as ReturnType<Weight['save']>;

    weight._weights.splice(0, weight._weights.length, ...json.weights);

    return weight;
  }
}
