import { Action } from '.';
import { ParseContext } from '../services/parseContext';

export class MessageAction extends Action {
  public static readonly Pattern = /^(@)?message\s*=\s*([^,)\s]+)/;

  private constructor(
    public readonly message: string,
    public readonly silent: boolean
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    return [new MessageAction(match[2], !!match[1])];
  }
}
