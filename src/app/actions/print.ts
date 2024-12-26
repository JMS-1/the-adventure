import { Action } from '.';
import { Context } from '../services/context';

export class PrintAction extends Action {
  public static readonly Pattern = /^&\$\$([^$]+)\$([^,)\s>]+)/;

  private constructor(
    public readonly obj: string,
    public readonly message: string
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: Context) {
    context.skip(match[0].length);

    return [new PrintAction(match[1], match[2])];
  }
}
