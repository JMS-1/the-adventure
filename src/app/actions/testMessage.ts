import { Action } from '.';
import { Context } from '../services/context';

export class TestMessageAction extends Action {
  public static readonly Pattern = /^if_message\s+([^\s]+)\s?/;

  private constructor(
    public readonly message: string,
    public readonly actions: Action[]
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: Context) {
    context.skip(match[0].length);

    for (;;) {
      const code = context.parse();

      if (code?.length) return [new TestMessageAction(match[1], code)];

      context.joinNext();
    }
  }
}
