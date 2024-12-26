import { Action } from '.';
import { ParseContext } from '../services/parseContext';

export class CallAction extends Action {
  public static readonly Pattern = /^([^\s,)=]+)\s+([^\s,)=]+)/;

  private constructor(
    public readonly obj: string,
    public readonly action: string
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    return new CallAction(match[1], match[2]);
  }
}
