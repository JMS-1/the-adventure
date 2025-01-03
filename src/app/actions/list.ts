import { Action } from '.';
import { ParseContext } from './parseContext';
import { RandomAction } from './random';

/** Create a list of actions - optional with a random choice. */
export class ListAction {
  /** ( '(' | ']' ) */
  public static readonly Pattern = /^([([])/;

  /**
   * Analyse the parsed statement.
   *
   * @param match match according to out pattern.
   * @param context current parings context.
   * @returns list of actions or action chooser.
   */
  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(1);

    for (const list: Action[] = []; ; ) {
      /** Eventually merge in next line. */
      context.enforceStart();

      /** Parse the next action. */
      const parsed = context.parse();
      const code = parsed && (Array.isArray(parsed) ? parsed : [parsed]);

      if (code?.length) {
        /** Add all actions parsed to the list. */
        list.push(...code);

        /** Eventually merge in next line. */
        context.enforceStart();

        /** List at its end. */
        if (context.start.startsWith(')')) {
          context.skip(1);

          /** Report the list or the chooser. */
          return match[1] === '(' ? list : new RandomAction(list);
        }

        /** Expect actions separated by comma. */
        if (!context.start.startsWith(',')) throw new Error('comma expected');

        context.skip(1);
      } else {
        /** Maybe incomplete - merge in next line of input. */
        context.joinNext();
      }
    }
  }
}
