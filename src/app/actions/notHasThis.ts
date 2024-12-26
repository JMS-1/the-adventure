import { Action } from '.';
import { ParseContext } from '../services/parseContext';

export class NotHasThisAction extends Action {
  public static readonly Pattern = /^if_nothasthis/;

  private constructor(public readonly actions: Action[]) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    return new NotHasThisAction(context.parseBody(match[0]));
  }
}
