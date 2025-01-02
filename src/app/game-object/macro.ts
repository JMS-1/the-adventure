import { Entity } from './entity';

export class Macro extends Entity {
  constructor(name: string, words: string) {
    super(name, words, null);
  }
}
