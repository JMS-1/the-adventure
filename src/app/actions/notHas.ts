import { Action } from '.';
import { ParseContext } from '../services/parseContext';

export class NotHasAction extends Action {
  public static readonly Pattern = /^if_nothas\s+([^\s]+)\s?/;

  private constructor(
    public readonly obj: string,
    public readonly actions: Action[]
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    return [new NotHasAction(match[1], Action.parseBody(context, match[0]))];
  }
}
