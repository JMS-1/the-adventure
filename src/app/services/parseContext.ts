import { Action } from '../actions';
import { DeadAction } from '../actions/dead';
import { DropAction } from '../actions/drop';
import { HasAction } from '../actions/has';
import { HasThisAction } from '../actions/hasThis';
import { HereAction } from '../actions/here';
import { ListAction } from '../actions/list';
import { MessageAction } from '../actions/message';
import { MoveAction } from '../actions/move';
import { NotHasAction } from '../actions/notHas';
import { NotHasThisAction } from '../actions/notHasThis';
import { NotHereAction } from '../actions/notHere';
import { PickAction } from '../actions/pick';
import { PrintAction } from '../actions/print';
import { RemoveAction } from '../actions/remove';
import { ResetAction } from '../actions/reset';
import { StartAction } from '../actions/start';
import { StopAction } from '../actions/stop';
import { TestMessageAction } from '../actions/testMessage';
import { TestNotPositionAction } from '../actions/testNotPosition';
import { TestPositionAction } from '../actions/testPosition';
import { TestStateAction } from '../actions/testState';

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
}
