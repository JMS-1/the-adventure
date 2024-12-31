import { Action } from '.';
import { CallAction } from './call';
import { DeadAction } from './dead';
import { DropAction } from './drop';
import { HasAction } from './has';
import { HasThisAction } from './hasThis';
import { HereAction } from './here';
import { ListAction } from './list';
import { MessageAction } from './message';
import { MoveAction } from './move';
import { NotHasAction } from './notHas';
import { NotHasThisAction } from './notHasThis';
import { NotHereAction } from './notHere';
import { PickAction } from './pick';
import { PrintAction } from './print';
import { RemoveAction } from './remove';
import { ResetAction } from './reset';
import { SetMessageAction } from './setMessage';
import { StartAction } from './start';
import { StopAction } from './stop';
import { TestMessageAction } from './testMessage';
import { TestNotPositionAction } from './testNotPosition';
import { TestPositionAction } from './testPosition';
import { TestStateAction } from './testState';

interface IActionParser {
  readonly Pattern: RegExp;

  parse(match: RegExpMatchArray, context: ParseContext): Action | Action[];
}

const parsers: IActionParser[] = [
  ListAction,
  DeadAction,
  PrintAction,
  TestMessageAction,
  TestStateAction,
  TestPositionAction,
  TestNotPositionAction,
  HasAction,
  NotHasAction,
  HereAction,
  NotHereAction,
  HasThisAction,
  NotHasThisAction,
  MoveAction,
  MessageAction,
  PickAction,
  DropAction,
  RemoveAction,
  ResetAction,
  StopAction,
  StartAction,
  /* Must be last in the indicated order. */
  SetMessageAction,
  CallAction,
];

export class ParseContext {
  constructor(
    public start: string,
    public lines: string[],
    public index: number
  ) {}

  joinNext() {
    if (++this.index >= this.lines.length)
      throw new Error('unterminated action');

    this.start = this.lines[this.index];
  }

  enforceStart() {
    while (!this.start) this.joinNext();
  }

  skip(n: number) {
    this.start = this.start.substring(n).trim();
  }

  parse() {
    for (const parser of parsers) {
      const match = parser.Pattern.exec(this.start);

      if (!match) continue;

      const parsed = parser.parse(match, this);
      const code = parsed && (Array.isArray(parsed) ? parsed : [parsed]);

      if (!code.length) throw new Error(`bad action '${this.start}'`);

      return code;
    }

    return;
  }

  parseBody(skip: string): Action[] {
    this.skip(skip.length);

    for (;;) {
      const code = this.parse();

      if (code)
        if (!Array.isArray(code)) return [code];
        else if (code.length) return code;

      this.joinNext();
    }
  }
}
