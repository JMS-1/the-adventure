import { Action } from '.';
import { Context } from '../services/context';

export class DeadAction extends Action {
  public static readonly Pattern = /^>>([^,)\s]+)/;

  private constructor(public readonly reason: string) {
    super();
  }

  static parse(match: RegExpMatchArray, context: Context) {
    context.skip(match[0].length);

    return [new DeadAction(match[1])];
  }
}
