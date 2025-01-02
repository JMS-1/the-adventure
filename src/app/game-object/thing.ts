import { Entity } from './entity';
import { Macro } from './macro';

export class Thing extends Entity {
  constructor(name: string, words: string, macro: Macro | null) {
    super(name, words, macro);
  }
}
