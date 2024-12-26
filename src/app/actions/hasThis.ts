import { Action } from '.';
import { ParseContext } from '../services/parseContext';

export class HasThisAction extends Action {
  public static readonly Pattern = /^if_hasthis\s?/;

  private constructor(public readonly actions: Action[]) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    return new HasThisAction(Action.parseBody(context, match[0]));
  }
}
