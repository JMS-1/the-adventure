import { Injectable } from '@angular/core';
import * as actions from './actions';

class Context {
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
}

@Injectable({ providedIn: 'root' })
export class ActionService {
  private readonly parseMessage = (
    match: RegExpMatchArray,
    context: Context
  ) => {
    context.skip(match[0].length);

    return [new actions.MessageAction(match[2], !!match[1])];
  };

  private readonly parsePick = (match: RegExpMatchArray, context: Context) => {
    context.skip(match[0].length);

    return [new actions.PickAction(match[3], !!match[1], !!match[2])];
  };

  private readonly parseDead = (match: RegExpMatchArray, context: Context) => {
    context.skip(match[0].length);

    return [new actions.DeadAction(match[1])];
  };

  private readonly parseGoto = (match: RegExpMatchArray, context: Context) => {
    context.skip(match[0].length);

    return [new actions.MoveAction(match[3] ?? null, match[4], !!match[1])];
  };

  private readonly parsePrint = (match: RegExpMatchArray, context: Context) => {
    context.skip(match[0].length);

    return [new actions.PrintAction(match[1], match[2])];
  };

  private readonly parseTestMessage = (
    match: RegExpMatchArray,
    context: Context
  ) => {
    context.skip(match[0].length);

    for (;;) {
      const code = this.parseAction(context);

      if (code?.length) return [new actions.TestMessageAction(match[1], code)];

      context.joinNext();
    }
  };

  private readonly parseList = (match: RegExpMatchArray, context: Context) => {
    context.skip(1);

    const list: actions.Action[] = [];

    for (;;) {
      context.enforceStart();

      const generated = this.parseAction(context);

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
  };

  private readonly parsers: [
    pattern: RegExp,
    generator: (match: RegExpMatchArray, context: Context) => actions.Action[]
  ][] = [
    [/^\(/, this.parseList],
    [/^>>([^,)\s]+)/, this.parseDead],
    [/^&\$\$([^$]+)\$([^,)\s>]+)/, this.parsePrint],
    [/^(#)?>(\$\$([^$]+)\$)?([^,)\s>]+)/, this.parseGoto],
    [/^(@)?message\s*=\s*([^,)\s]+)/, this.parseMessage],
    [/^(@)?(#)?<([^,)\s]+)/, this.parsePick],
    [/^if_message\s+([^\s]+)\s?/, this.parseTestMessage],
  ];

  parse(
    start: string,
    key: 'none' | 'single' | 'multiple',
    lines: string[],
    index: number
  ): [actions: actions.Action[], index: number] {
    const context = new Context(start, lines, index);

    for (;;) {
      const generated = this.parseAction(context);

      if (generated?.length)
        if (context.start) throw new Error('unterminated action');
        else return [generated, context.index];

      context.joinNext();
    }
  }

  private parseAction(context: Context) {
    for (const [pattern, generator] of this.parsers) {
      const match = pattern.exec(context.start);

      if (!match) continue;

      const code = generator(match, context);

      if (!code.length) throw new Error(`bad action '${context.start}'`);

      return code;
    }

    return;
  }
}
