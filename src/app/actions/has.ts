import { Action } from '.';
import { ParseContext } from '../services/parseContext';

export class HasAction extends Action {
  public static readonly Pattern = /^(#)?if_has\s+([^\s]+)/;

  private constructor(
    public readonly obj: string,
    public readonly self: boolean,
    public readonly actions: Action[]
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    return new HasAction(match[2], !!match[1], context.parseBody(match[0]));
  }
}
