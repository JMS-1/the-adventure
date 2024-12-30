import { TActionMap } from '../actions';
import { GameService } from '../services/game.service';
import { MessagesService } from '../services/messages.service';
import { type Macro } from './macro';

export abstract class GameObject {
  message = '';

  actions: TActionMap = {};

  things = new Set<string>();

  persons = new Set<string>();

  constructor(public readonly name: string, macro: Macro | null) {
    if (macro) {
      this.actions = { ...macro.actions };
      this.message = macro.message;
      this.persons = new Set(macro.persons);
      this.things = new Set(macro.things);
    }
  }

  static parseWords(words: string) {
    return words?.split(',').filter((w) => w);
  }

  setMessage(msg: string) {
    this.message = msg.trim();
  }

  setActions(actions: TActionMap) {
    for (const action of Object.keys(actions))
      if (this.actions[action])
        throw new Error(`duplicate action ${this.name}.${action}`);
      else this.actions[action] = actions[action];
  }

  private addToObjectList(list: string, set: Set<string>) {
    if (!list.startsWith('(')) list = `(${list})`;
    else if (!list.endsWith(')')) throw new Error('bad list of objects');

    for (const thingOrPerson of list.substring(1, list.length - 1).split(','))
      set.add(thingOrPerson.trim());
  }

  setThings(things: string) {
    this.addToObjectList(things, this.things);
  }

  setPersons(persons: string) {
    this.addToObjectList(persons, this.persons);
  }

  loadDefaults(game: GameService) {
    if (!this.message) this.message = game.defaults.message || '*';

    this.getMessage(game.messages);
  }

  validate(game: GameService) {
    for (const thing of this.things)
      if (!game.objects.thingOrPerson[thing])
        throw new Error(`${this.name}: unknown thing or person ${thing}`);

    for (const actions of Object.values(this.actions))
      actions.forEach((a) => a.validate(game, this));
  }

  abstract getMessageKey(message: string): string;

  getMessage(messages: MessagesService, message = this.message) {
    if (message === '*') return;

    const choices = messages.messageMap[this.getMessageKey(message)];

    if (!choices) throw new Error(`${this.name}: no message ${message}`);

    return choices;
  }
}
