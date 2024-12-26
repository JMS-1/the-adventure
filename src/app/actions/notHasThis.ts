import { Action } from '.';
import { ParseContext } from '../services/parseContext';

export class NotHasThisAction extends Action {
  public static readonly Pattern = /^if_nothasthis\s?/;

  private constructor(public readonly actions: Action[]) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    return new NotHasThisAction(Action.parseBody(context, match[0]));
  }
}
