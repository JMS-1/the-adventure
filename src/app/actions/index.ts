import { ParseContext } from '../services/parseContext';

export abstract class Action {
  protected static parseBody(context: ParseContext, skip: string): Action[] {
    context.skip(skip.length);

    for (;;) {
      const code = context.parse();

      if (code?.length) return code;

      context.joinNext();
    }
  }
}
