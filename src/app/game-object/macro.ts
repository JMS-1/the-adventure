import { Entitiy } from './entity';

export class Macro extends Entitiy {
  constructor(name: string, words: string) {
    super(name, words, null);
  }
}
