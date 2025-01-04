import { Injectable } from '@angular/core';
import { Action, TActionMap } from '../actions';
import { CountedAction } from '../actions/counted';
import { ParseContext } from '../actions/parse-context';
import { GameObject } from '../game-object';

/** <name of allowed characters> ':' */
const nameReg = /^([+a-zA-Zäöüß0-9_*/,]+)\s*:/;

/** <name(s)> {'/' <1..99>} */
const repeatReg = /^([^/]+)((\/[1-9]\d?)*)$/;

/**
 * Split a key definition in name and optional repetition pattern.
 *
 * @param key full key.
 * @param actions actions to use.
 * @returns key and actions, possibly wrapped with a counter action.
 */
function splitKey(key: string, actions: Action[]) {
  const match = repeatReg.exec(key);

  if (!match) throw Error(`bad key ${key}`);

  /** Report actions as is or wrapped in a counter action using the counts given. */
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

/**
 * Split a list of key definitions separated by comma.
 *
 * @param keys key, list of keys or empty.
 * @param actions actions for the key.
 * @returns list of keys, actions and repetition count information.
 */
function splitKeys(keys: string, actions: Action[]) {
  return keys
    ? GameObject.parseWords(keys).map((key) => splitKey(key, actions))
    : [{ key: '', actions }];
}

/** Action parsing helper. */
@Injectable({ providedIn: 'root' })
export class ActionService {
  /**
   * Just parse an action.
   *
   * @param start part of first line to process.
   * @param lines all lines to process.
   * @param index index of the current line.
   * @returns list of actions and next line index if we advances.
   */
  parse(
    start: string,
    lines: string[],
    index: number
  ): [actions: TActionMap, number] {
    return this.parseSingle('', new ParseContext(start, lines, index));
  }

  /**
   * Parse a actions for a given key.
   *
   * @param keys single or multiple keys.
   * @param context current parsing context.
   * @return map with all keys and the same list of actions.
   */
  private parseSingle(
    keys: string,
    context: ParseContext
  ): [actions: TActionMap, number] {
    for (;;) {
      /** Try to generate actions from the current input. */
      const generated = context.parse();

      /** Make sure the there is no extra garbage on line if parsing succeeded. */
      if (generated?.length)
        if (context.start) throw new Error('unterminated action');
        else {
          /** Create map with all keys using the same action list. */
          const actions: TActionMap = {};

          for (const keyInfo of splitKeys(keys, generated))
            actions[keyInfo.key] = keyInfo.actions;

          return [actions, context.index];
        }

      /** Try join in of next line. */
      context.joinNext();
    }
  }

  /**
   * Parse a single named action list.
   *
   * @param start part of first line to process.
   * @param lines all lines to process.
   * @param index index of the current line.
   * @returns map with all keys declared.
   */
  parseNamed(
    start: string,
    lines: string[],
    index: number
  ): [actions: TActionMap, number] {
    /** Go for the key definition. */
    const context = new ParseContext(start, lines, index);

    context.enforceStart();

    const match = nameReg.exec(context.start);

    if (!match) throw new Error(`key missing: ${context.start}`);

    /** Parse the rest of the line for the actions. */
    context.skip(match[0].length);

    return this.parseSingle(match[1], context);
  }

  /**
   * Parse a named action list.
   *
   * @param start part of first line to process.
   * @param lines all lines to process.
   * @param index index of the current line.
   * @returns map with all keys declared.
   */
  parseMultiple(
    start: string,
    lines: string[],
    index: number
  ): [actions: TActionMap, number] {
    const context = new ParseContext(start, lines, index);

    context.enforceStart();

    /** This is only a single key. */
    if (!context.start.startsWith('('))
      return this.parseNamed(start, lines, index);

    /** Must create a full map of actions - may include a single key as well. */
    const map: TActionMap = {};

    do {
      /** Eat up the brace. */
      context.skip(1);

      context.enforceStart();

      /** Lookup the key. */
      const match = nameReg.exec(context.start);

      if (!match) throw new Error(`key missing: ${context.start}`);

      /** Parse the body of the key definition and add the resulting actions to the map respecting all possible keys. */
      for (const keyInfo of splitKeys(match[1], context.parseBody(match[0])))
        map[keyInfo.key] = [...(map[keyInfo.key] || []), ...keyInfo.actions];

      /** Continue as long as there is another key declaration after a comma. */
      context.enforceStart();
    } while (context.start.startsWith(','));

    /** Check for closing brace and report resulting map. */
    if (context.start !== ')') throw new Error('unterminated action map');

    return [map, context.index];
  }
}
