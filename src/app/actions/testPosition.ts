import { Action } from '.';
import { ParseContext } from '../services/parseContext';

export class TestPositionAction extends Action {
  public static readonly Pattern =
    /^(#)?if_position\s+\$\$([^$]+)\$([^\s]+)\s?/;

  private constructor(
    public readonly area: string,
    public readonly room: string,
    public readonly always: boolean,
    public readonly actions: Action[]
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    for (;;) {
      const code = context.parse();

      if (code?.length)
        return [new TestPositionAction(match[2], match[3], !!match[1], code)];

      context.joinNext();
    }
  }
}
