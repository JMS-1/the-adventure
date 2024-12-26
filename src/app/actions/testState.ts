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
    return [
      new TestStateAction(
        match[1],
        match[2],
        Action.parseBody(context, match[0])
      ),
    ];
  }
}
