import { Action } from '.';
import { ParseContext } from '../services/parseContext';

export class MoveAction extends Action {
  public static readonly Pattern = /^(#)?>(\$\$([^$]+)\$)?([^,)\s>]+)/;

  private constructor(
    public readonly area: string | null,
    public readonly room: string,
    public readonly always: boolean
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    return new MoveAction(match[3] ?? null, match[4], !!match[1]);
  }
}
