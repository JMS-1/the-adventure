import { Action } from '.';
import { ParseContext } from '../services/parseContext';

export class StartAction extends Action {
  public static readonly Pattern = /^start/;

  private constructor() {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    return new StartAction();
  }
}
