import { Action } from '.';
import { ParseContext } from '../services/parseContext';

export class StopAction extends Action {
  public static readonly Pattern = /^stop/;

  private constructor() {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    return new StopAction();
  }
}
