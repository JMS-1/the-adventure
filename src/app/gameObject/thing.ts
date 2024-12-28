import { ThingOrPerson } from './thingOrPerson';

export class Thing extends ThingOrPerson {
  constructor(name: string, words: string) {
    super(name, words);
  }
}
