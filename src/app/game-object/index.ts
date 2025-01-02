import { Action, TActionMap } from '../actions';
import { GameService } from '../services/game.service';
import { MessagesService } from '../services/messages.service';
import { type Macro } from './macro';

export abstract class GameObject {
  message = '';

  actions: TActionMap = {};

  thingsOrPersons = new Set<string>();

  constructor(public readonly name: string, macro: Macro | null) {
    if (macro) {
      this.actions = { ...macro.actions };
      this.message = macro.message;
      this.thingsOrPersons = new Set(macro.thingsOrPersons);
    }
  }

  get key() {
    return this.name;
  }

  static parseWords(words: string) {
    return words
      ?.split(',')
      .map((w) => w.trim())
      .filter((w) => w);
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

  private addToObjectList(list: string) {
    if (!list.startsWith('(')) list = `(${list})`;
    else if (!list.endsWith(')')) throw new Error('bad list of objects');

    for (const thingOrPerson of list.substring(1, list.length - 1).split(','))
      this.thingsOrPersons.add(thingOrPerson.trim());
  }

  setThings(things: string) {
    this.addToObjectList(things);
  }

  setPersons(persons: string) {
    this.addToObjectList(persons);
  }

  loadDefaults(game: GameService) {
    if (!this.message) this.message = game.defaults.message || '*';

    this.getMessage(game.messages);
  }

  validate(game: GameService) {
    for (const thing of this.thingsOrPersons)
      if (!game.objects.thingOrPerson[thing])
        throw new Error(`${this.name}: unknown thing or person ${thing}`);

    for (const actions of Object.values(this.actions))
      actions.forEach((a) => a.validate(game, this));

    game.player.CarriedObjects[this.key] = new Set(this.thingsOrPersons);

    game.player.setMessage(this, this.message, true);
  }

  abstract getMessageKey(message: string): string;

  getMessage(messages: MessagesService, message = this.message) {
    if (message === '*') return;

    const choices = messages.messageMap[this.getMessageKey(message)];

    if (!choices) throw new Error(`${this.name}: no message ${message}`);

    return choices;
  }

  runAction(action: string, game: GameService) {
    return Action.run(this.actions[action] ?? [], this, game);
  }
}
