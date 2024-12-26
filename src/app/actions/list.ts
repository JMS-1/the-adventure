import { Action } from '.';
import { ParseContext } from '../services/parseContext';

export class ListAction {
  public static readonly Pattern = /^\(/;

  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(1);

    const list: Action[] = [];

    for (;;) {
      context.enforceStart();

      const generated = context.parse();

      if (!generated?.length) context.joinNext();
      else {
        list.push(...generated);

        context.enforceStart();

        if (context.start.startsWith(')')) {
          context.skip(1);

          return list;
        }

        if (!context.start.startsWith(',')) throw new Error('comma expected');

        context.skip(1);
      }
    }
  }
}
