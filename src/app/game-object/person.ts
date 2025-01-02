import { Entity } from './entity';
import { Macro } from './macro';

export class Person extends Entity {
  constructor(name: string, words: string, macro: Macro | null) {
    super(name, words, macro);
  }
}
