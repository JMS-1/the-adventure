import { Action } from '.';
import { ParseContext } from '../services/parseContext';

export class SetMessageAction extends Action {
  public static readonly Pattern = /^(@)?([^\s,)]+)\s*=\s*([^,)\s]+)/;

  private constructor(
    public readonly obj: string,
    public readonly message: string,
    public readonly silent: boolean
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    return new SetMessageAction(match[2], match[3], !!match[1]);
  }
}
