import { Injectable } from '@angular/core';

export abstract class Action {}

export class MessageAction extends Action {
  constructor(
    public readonly message: string,
    public readonly optional: boolean
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
  private readonly parseMessage = (match: RegExpMatchArray) => {
    return [new MessageAction(match[2], !!match[1])];
  };

  private readonly parseList = (match: RegExpMatchArray, context: Context) => {
    const list: Action[] = [];

    context.start = match[1];

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
    [/^\s*(@)?message\s*=\s*([^,)\s]+)/, this.parseMessage],
    [/^\s*\((.*)$/, this.parseList],
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

      context.skip(match[0].length);

      return code;
    }

    return;
  }
}
