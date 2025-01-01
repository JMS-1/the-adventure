import { ThingOrPerson } from './thingOrPerson';

export class Macro extends ThingOrPerson {
  constructor(name: string, words: string) {
    super(name, words, null);
  }
}
