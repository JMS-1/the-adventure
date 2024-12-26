import { Action } from '.';
import { ParseContext } from '../services/parseContext';

export class HereAction extends Action {
  public static readonly Pattern = /^if_here\s+([^\s]+)\s?/;

  private constructor(
    public readonly obj: string,
    public readonly actions: Action[]
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    return new HereAction(match[1], Action.parseBody(context, match[0]));
  }
}
