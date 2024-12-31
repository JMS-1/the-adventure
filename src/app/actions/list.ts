import { Action } from '.';
import { ParseContext } from './parseContext';
import { RandomAction } from './random';

export class ListAction {
  public static readonly Pattern = /^([([])/;

  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(1);

    const list: Action[] = [];

    for (;;) {
      context.enforceStart();

      const parsed = context.parse();
      const code = parsed && (Array.isArray(parsed) ? parsed : [parsed]);

      if (!code?.length) context.joinNext();
      else {
        list.push(...code);

        context.enforceStart();

        if (context.start.startsWith(')')) {
          context.skip(1);

          return match[1] === '(' ? list : new RandomAction(list);
        }

        if (!context.start.startsWith(',')) throw new Error('comma expected');

        context.skip(1);
      }
    }
  }
}
