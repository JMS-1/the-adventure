import { Action } from '.';
import { ParseContext } from '../services/parseContext';

export class NotHereAction extends Action {
  public static readonly Pattern = /^if_nothere\s+([^\s]+)/;

  private constructor(
    public readonly obj: string,
    public readonly actions: Action[]
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    return new NotHereAction(match[1], context.parseBody(match[0]));
  }
}
