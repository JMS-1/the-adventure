import { ThingOrPerson } from './thingOrPerson';

export class Person extends ThingOrPerson {
  constructor(name: string, words: string) {
    super(name, words);
  }
}
