import { Injectable } from '@angular/core';
import { Action, TActionMap } from '../actions';
import { CountedAction } from '../actions/counted';
import { ParseContext } from '../actions/parseContext';
import { GameObject } from '../game-object';

const nameReg = /^([^:\s]+)\s*:/;

const repeatReg = /^([^/]+)((\/[1-9]\d?)*)$/;

function splitKey(key: string, actions: Action[]) {
  const match = repeatReg.exec(key);

  if (!match) throw Error(`bad key ${key}`);

  return {
    key: match[1],
    actions: match[2]
      ? [
          new CountedAction(
            match[1],
            match[2]
              .split('/')
              .slice(1)
              .map((n) => parseInt(n)),
            actions
          ),
        ]
      : actions,
  };
}

function splitKeys(keys: string, actions: Action[]) {
  return keys
    ? GameObject.parseWords(keys).map((key) => splitKey(key, actions))
    : [{ key: '', actions }];
}

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

          for (const keyInfo of splitKeys(key, generated))
            actions[keyInfo.key] = keyInfo.actions;

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

      for (const keyInfo of splitKeys(match[1], context.parseBody(match[0])))
        map[keyInfo.key] = [...(map[keyInfo.key] || []), ...keyInfo.actions];

      context.enforceStart();
    } while (context.start.startsWith(','));

    if (context.start !== ')') throw new Error('unterminated action map');

    return [map, context.index];
  }
}
