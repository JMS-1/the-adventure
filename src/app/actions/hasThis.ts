import { Action } from '.';
import { ParseContext } from '../services/parseContext';

export class HasThisAction extends Action {
  public static readonly Pattern = /^if_hasthis/;

  private constructor(public readonly actions: Action[]) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    return new HasThisAction(context.parseBody(match[0]));
  }
}
