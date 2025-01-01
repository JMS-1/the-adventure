import { Macro } from './macro';
import { ThingOrPerson } from './thingOrPerson';

export class Thing extends ThingOrPerson {
  constructor(name: string, words: string, macro: Macro | null) {
    super(name, words, macro);
  }
}
