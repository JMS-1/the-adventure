import { Action } from '.';
import { Context } from '../services/context';

export class PickAction extends Action {
  public static readonly Pattern = /^(@)?(#)?<([^,)\s]+)/;

  private constructor(
    public readonly what: string,
    public readonly silent: boolean,
    public readonly always: boolean
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: Context) {
    context.skip(match[0].length);

    return [new PickAction(match[3], !!match[1], !!match[2])];
  }
}
