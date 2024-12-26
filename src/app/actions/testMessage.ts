import { Action } from '.';
import { ParseContext } from '../services/parseContext';

export class TestMessageAction extends Action {
  public static readonly Pattern = /^if_message\s+([^\s]+)/;

  private constructor(
    public readonly message: string,
    public readonly actions: Action[]
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    return new TestMessageAction(match[1], context.parseBody(match[0]));
  }
}
