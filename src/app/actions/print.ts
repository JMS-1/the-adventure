import { Action } from '.';
import { ParseContext } from '../services/parseContext';

export class PrintAction extends Action {
  public static readonly Pattern = /^&(\$\$([^$]+)\$)?([^,)\s]+)/;

  private constructor(
    public readonly area: string | null,
    public readonly message: string
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    return new PrintAction(match[2] ?? null, match[3]);
  }
}
