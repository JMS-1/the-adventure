import { Injectable } from '@angular/core';
import { Action } from '../actions';
import { ParseContext } from './parseContext';

@Injectable({ providedIn: 'root' })
export class ActionService {
  parse(
    start: string,
    key: 'none' | 'single' | 'multiple',
    lines: string[],
    index: number
  ): [actions: Action[], index: number] {
    const context = new ParseContext(start, lines, index);

    for (;;) {
      const generated = context.parse();

      if (generated?.length)
        if (context.start) throw new Error('unterminated action');
        else return [generated, context.index];

      context.joinNext();
    }
  }
}
