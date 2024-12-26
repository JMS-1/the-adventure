import { Action } from '.';
import { ParseContext } from '../services/parseContext';

export class ResetAction extends Action {
  public static readonly Pattern = /^reset/;

  private constructor() {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    return new ResetAction();
  }
}
