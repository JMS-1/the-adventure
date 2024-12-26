import { Action } from '.';
import { ParseContext } from '../services/parseContext';

export class TestStateAction extends Action {
  public static readonly Pattern = /^if_state\s+([^\s]+)\s+([^\s]+)\s?/;

  private constructor(
    public readonly obj: string,
    public readonly message: string,
    public readonly actions: Action[]
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    for (;;) {
      const code = context.parse();

      if (code?.length) return [new TestStateAction(match[1], match[2], code)];

      context.joinNext();
    }
  }
}