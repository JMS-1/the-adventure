import { Action } from '.';
import { ParseContext } from '../services/parseContext';

export class DropAction extends Action {
  public static readonly Pattern = /^(@)?(#)?!([^,)\s]+)/;

  private constructor(
    public readonly what: string,
    public readonly silent: boolean,
    public readonly self: boolean
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    return new DropAction(match[3], !!match[1], !!match[2]);
  }
}
