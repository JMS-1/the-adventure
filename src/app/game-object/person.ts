import { Entitiy } from './entity';
import { Macro } from './macro';

export class Person extends Entitiy {
  constructor(name: string, words: string, macro: Macro | null) {
    super(name, words, macro);
  }
}
