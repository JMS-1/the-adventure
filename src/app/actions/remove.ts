import { Action } from '.';
import { ParseContext } from '../services/parseContext';

export class RemoveAction extends Action {
  public static readonly Pattern = /^remove/;

  private constructor() {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    return new RemoveAction();
  }
}
