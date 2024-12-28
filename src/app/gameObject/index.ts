import { TActionMap } from '../actions';

export abstract class GameObject {
  message = '';

  actions: TActionMap = {};

  things = new Set<string>();

  persons = new Set<string>();

  constructor(public readonly name: string) {}

  static parseWords(words: string) {
    return words?.split(',').filter((w) => w);
  }

  setMessage(msg: string) {
    if (this.message) throw new Error(`duplicate message for ${this.name}`);

    this.message = msg;
  }

  setActions(actions: TActionMap) {
    for (const action of Object.keys(actions))
      if (this.actions[action])
        throw new Error(`duplicate action ${this.name}.${action}`);
      else this.actions[action] = actions[action];
  }

  setThings(things: string) {
    if (!things.startsWith('(')) things = `(${things})`;
    else if (!things.endsWith(')')) throw new Error('bad list of things');

    for (const thing of things.substring(1, things.length - 2).split(','))
      this.things.add(thing.trim());
  }

  setPersons(persons: string) {
    if (!persons.startsWith('(')) persons = `(${persons})`;
    else if (!persons.endsWith(')')) throw new Error('bad list of persons');

    for (const person of persons.substring(1, persons.length - 2).split(','))
      this.things.add(person.trim());
  }
}
