import { Action } from '.';
import { CallAction } from './call';
import { DeadAction } from './dead';
import { DropAction } from './drop';
import { HasAction } from './has';
import { HasThisAction } from './has-this';
import { HereAction } from './here';
import { ListAction } from './list';
import { MessageAction } from './message';
import { MoveAction } from './move';
import { NotHasAction } from './not-has';
import { NotHasThisAction } from './not-has-this';
import { NotHereAction } from './not-here';
import { PickAction } from './pick';
import { PrintAction } from './print';
import { RemoveAction } from './remove';
import { ResetAction } from './reset';
import { SetMessageAction } from './set-message';
import { StartAction } from './start';
import { StopAction } from './stop';
import { TestMessageAction } from './test-message';
import { TestNotPositionAction } from './test-not-position';
import { TestPositionAction } from './test-position';
import { TestStateAction } from './test-state';

/** Signature of a parsable action class. */
interface IActionParser {
  /** Static regular expression. */
  readonly Pattern: RegExp;

  /** Static method to create an action instance after a sucessfull regular expression matching. */
  parse(match: RegExpMatchArray, context: ParseContext): Action | Action[];
}

/** All supported actions. */
const parsers: IActionParser[] = [
  DeadAction,
  DropAction,
  HasAction,
  HasThisAction,
  HereAction,
  ListAction,
  MessageAction,
  MoveAction,
  NotHasAction,
  NotHasThisAction,
  NotHereAction,
  PickAction,
  PrintAction,
  RemoveAction,
  ResetAction,
  StartAction,
  StopAction,
  TestMessageAction,
  TestNotPositionAction,
  TestPositionAction,
  TestStateAction,
  /* Must be last in the indicated order. */
  SetMessageAction,
  CallAction,
];

/** Parsing helper. */
export class ParseContext {
  /**
   * Create a new helper instance.
   *
   * @param start first line to inspect - typically clipped off at the left.
   * @param lines all lines.
   * @param index index of the line with the start text.
   */
  constructor(
    public start: string,
    public lines: string[],
    public index: number
  ) {}

  /** Merge in the next line into the command to analyse. */
  joinNext() {
    if (++this.index >= this.lines.length)
      throw new Error('unterminated action');

    this.start += this.lines[this.index];
  }

  /** Make sure the command to analyse is not emtpy. */
  enforceStart() {
    while (!this.start) this.joinNext();
  }

  /**
   * Clip off characters from the left of the current
   * command and remove leading spaces.
   *
   * @param n Number of characters to get rid off.
   */
  skip(n: number) {
    this.start = this.start.substring(n).trim();
  }

  /** Try to analyse the current command. */
  parse() {
    for (const parser of parsers) {
      /** Check command as is. */
      const match = parser.Pattern.exec(this.start);

      if (!match) continue;

      /** Create the action from the match and make it an array of actions. */
      const parsed = parser.parse(match, this);
      const actions = parsed && (Array.isArray(parsed) ? parsed : [parsed]);

      if (!actions.length) throw new Error(`bad action '${this.start}'`);

      /** Report list of actions - typically only one but can be a list as well. */
      return actions;
    }

    /** No match found. */
    return;
  }

  /**
   * Parse the body of a conditional statement.
   *
   * @param skip prefix detected so far.
   * @returns actions in the body.
   */
  parseBody(skip: string): Action[] {
    /** Skip what we matched so far. */
    this.skip(skip.length);

    for (;;) {
      /** Try to get the body. */
      const actions = this.parse();

      if (actions?.length) return actions;

      /** Maybe some statements are incomplete so just join the next line. */
      this.joinNext();
    }
  }
}
