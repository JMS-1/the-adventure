import { Injectable } from '@angular/core';

export abstract class Action {}

export class MessageAction extends Action {
  constructor(
    public readonly message: string,
    public readonly silent: boolean
  ) {
    super();
  }
}

export class PickAction extends Action {
  constructor(
    public readonly what: string,
    public readonly silent: boolean,
    public readonly always: boolean
  ) {
    super();
  }
}

export class DeadAction extends Action {
  constructor(public readonly reason: string) {
    super();
  }
}

export class MoveAction extends Action {
  constructor(
    public readonly area: string | null,
    public readonly room: string,
    public readonly always: boolean
  ) {
    super();
  }
}

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

    return [new MessageAction(match[2], !!match[1])];
  };

  private readonly parsePick = (match: RegExpMatchArray, context: Context) => {
    context.skip(match[0].length);

    return [new PickAction(match[3], !!match[1], !!match[2])];
  };

  private readonly parseDead = (match: RegExpMatchArray, context: Context) => {
    context.skip(match[0].length);

    return [new DeadAction(match[1])];
  };

  private readonly parseGoto = (match: RegExpMatchArray, context: Context) => {
    context.skip(match[0].length);

    return [new MoveAction(match[3] ?? null, match[4], !!match[1])];
  };

  private readonly parseList = (match: RegExpMatchArray, context: Context) => {
    context.skip(1);

    const list: Action[] = [];

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
    generator: (match: RegExpMatchArray, context: Context) => Action[]
  ][] = [
    [/^\(/, this.parseList],
    [/^>>([^,)\s]+)/, this.parseDead],
    [/^(#)?>(\$\$([^$]+)\$)?([^,)\s>]+)/, this.parseGoto],
    [/^(@)?message\s*=\s*([^,)\s]+)/, this.parseMessage],
    [/^(@)?(#)?<([^,)\s]+)/, this.parsePick],
  ];

  parse(
    start: string,
    key: 'none' | 'single' | 'multiple',
    lines: string[],
    index: number
  ): [actions: Action[], index: number] {
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
