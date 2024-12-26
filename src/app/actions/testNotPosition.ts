import { Action } from '.';
import { ParseContext } from '../services/parseContext';

export class TestNotPositionAction extends Action {
  public static readonly Pattern =
    /^(#)?if_notposition\s+\$\$([^$]+)\$([^\s]+)\s?/;

  private constructor(
    public readonly area: string,
    public readonly room: string,
    public readonly self: boolean,
    public readonly actions: Action[]
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    return new TestNotPositionAction(
      match[2],
      match[3],
      !!match[1],
      Action.parseBody(context, match[0])
    );
  }
}
