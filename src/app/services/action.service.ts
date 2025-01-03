import { Injectable } from '@angular/core';
import { TActionMap } from '../actions';
import { ParseContext } from '../actions/parseContext';
import { GameObject } from '../game-object';

const nameReg = /^([^:\s]+)\s*:/;

@Injectable({ providedIn: 'root' })
export class ActionService {
  parse(start: string, lines: string[], index: number) {
    return this.parseSingle('', new ParseContext(start, lines, index));
  }

  private parseSingle(
    key: string,
    context: ParseContext
  ): [actions: TActionMap, number] {
    for (;;) {
      const generated = context.parse();

      if (generated?.length)
        if (context.start) throw new Error('unterminated action');
        else {
          const actions: TActionMap = {};

          for (const word of key ? GameObject.parseWords(key) : [key])
            actions[word] = generated;

          return [actions, context.index];
        }

      context.joinNext();
    }
  }

  parseNamed(start: string, lines: string[], index: number) {
    const context = new ParseContext(start, lines, index);

    context.enforceStart();

    const match = nameReg.exec(context.start);

    if (!match) throw new Error(`key missing: ${context.start}`);

    context.skip(match[0].length);

    return this.parseSingle(match[1], context);
  }

  parseMultiple(
    start: string,
    lines: string[],
    index: number
  ): [actions: TActionMap, number] {
    const context = new ParseContext(start, lines, index);

    context.enforceStart();

    if (!context.start.startsWith('(')) {
      const match = nameReg.exec(context.start);

      if (!match) throw new Error(`key missing: ${context.start}`);

      context.skip(match[0].length);

      return this.parseSingle(match[1], context);
    }

    const map: TActionMap = {};

    do {
      context.skip(1);

      context.enforceStart();

      const match = nameReg.exec(context.start);

      if (!match) throw new Error(`key missing: ${context.start}`);

      const actions = context.parseBody(match[0]);

      for (const key of GameObject.parseWords(match[1]))
        map[key] = [...(map[key] || []), ...actions];

      context.enforceStart();
    } while (context.start.startsWith(','));

    if (context.start !== ')') throw new Error('unterminated action map');

    return [map, context.index];
  }
}
