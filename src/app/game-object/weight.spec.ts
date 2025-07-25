import { Weight } from './weight';

describe('Weight', () => {
  it('can serialize', () => {
    const weight = new Weight('(13,14,15)');

    expect(weight.save()).toEqual({
      weights: [13, 14, 15],
    });
  });

  it('can de-serialize', () => {
    const weight = Weight.load({ weights: [13, 14, 15] });

    expect(weight.save()).toEqual({ weights: [13, 14, 15] });

    expect(weight.toString()).toBe('[13,14,15]');
  });
});
