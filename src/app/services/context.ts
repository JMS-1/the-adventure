import { Action } from '../actions';
import { DeadAction } from '../actions/dead';
import { ListAction } from '../actions/list';
import { MessageAction } from '../actions/message';
import { MoveAction } from '../actions/move';
import { PickAction } from '../actions/pick';
import { PrintAction } from '../actions/print';
import { TestMessageAction } from '../actions/testMessage';
import { TestStateAction } from '../actions/testState';

interface IActionParser {
  readonly Pattern: RegExp;

  parse(match: RegExpMatchArray, context: Context): Action[];
}

const parsers: IActionParser[] = [
  ListAction,
  DeadAction,
  PrintAction,
  TestMessageAction,
  TestStateAction,
  MoveAction,
  MessageAction,
  PickAction,
];

export class Context {
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

      const code = parser.parse(match, this);

      if (!code.length) throw new Error(`bad action '${this.start}'`);

      return code;
    }

    return;
  }
}
