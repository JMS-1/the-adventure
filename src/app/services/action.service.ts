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

const parsers: [
  pattern: RegExp,
  generator: (match: RegExpMatchArray) => Action[]
][] = [
  [/\s*(@)?message\s*=\s*([^,)\s]+)/, (m) => [new MessageAction(m[2], !!m[1])]],
];

@Injectable({ providedIn: 'root' })
export class ActionService {
  parse(
    start: string,
    key: 'none' | 'single' | 'multiple',
    lines: string[],
    index: number
  ): [actions: Action[], index: number] {
    while (!start)
      if (++index >= lines.length) throw new Error('unterminated action');
      else start = lines[index];

    const actions: Action[] = [];

    const generated = this.checkParsers(start);

    if (!generated?.length) throw new Error('unknown action');

    actions.push(...generated);

    return [actions, index];
  }

  private checkParsers(start: string) {
    for (const [pattern, generator] of parsers) {
      const match = pattern.exec(start);

      if (!match) continue;

      const code = generator(match);

      if (!code.length) throw new Error(`bad action '${start}'`);

      return code;
    }

    return;
  }
}
