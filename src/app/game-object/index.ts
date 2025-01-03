import { TActionMap } from '../actions';
import { GameService } from '../services/game.service';
import { MessagesService } from '../services/messages.service';
import { type Macro } from './macro';

/** Base of a game object. */
export abstract class GameObject {
  /** Configured message of the game object. */
  message = '';

  /** Configured actions of the game object. */
  readonly actions: TActionMap = {};

  /** Configured list ot things and persons attached to this game object. */
  entities = new Set<string>();

  /**
   * Initialize a new game object.
   *
   * @param name short name of the game object.
   * @param macro macro used to clone the game object from.
   */
  constructor(public readonly name: string, macro: Macro | null) {
    /** May want to initialize from a macro - supported for entities only. */
    if (macro) {
      this.actions = { ...macro.actions };
      this.message = macro.message;
      this.entities = new Set(macro.entities);
    }
  }

  /** Unique name of the game object - first guess is the short name. */
  get key() {
    return this.name;
  }

  /**
   * Parse a list of words to an array.
   *
   * @param words list of words, separated be comma.
   * @returns all non-empty words from the list - empty words will be silently removed.
   */
  static parseWords(words: string) {
    return words
      ?.split(',')
      .map((w) => w.trim())
      .filter((w) => w);
  }

  /**
   * Set the configured message of the game object.
   *
   * @param msg configured message.
   */
  setMessage(msg: string) {
    this.message = msg.trim();
  }

  /**
   * Add actions to the action map of the game object.
   *
   * @param actions actions to add - if duplicates are detected
   * an error is thrown.
   */
  addActions(actions: TActionMap) {
    for (const action of Object.keys(actions))
      if (this.actions[action])
        throw new Error(`duplicate action ${this.name}.${action}`);
      else this.actions[action] = actions[action];
  }

  /**
   * Add a list of entity names to the list attached to this
   * game object.
   *
   * @param list list of comma separated names or a single name -
   * list must be collected.
   */
  private addToObjectList(list: string) {
    if (list.startsWith('('))
      if (list.endsWith(')')) list = list.substring(1, list.length - 1);
      else throw new Error('bad list of objects');

    for (const entity of GameObject.parseWords(list)) this.entities.add(entity);
  }

  /**
   * Add things to list of children.
   *
   * @param list list of comma separated names or a single name -
   * list must be collected.
   */
  setThings(things: string) {
    this.addToObjectList(things);
  }

  /**
   * Add persons to list of children.
   *
   * @param list list of comma separated names or a single name -
   * list must be collected.
   */
  setPersons(persons: string) {
    this.addToObjectList(persons);
  }

  /**
   * Load defaults into the game object.
   *
   * @param game active game.
   */
  loadDefaults(game: GameService) {
    /** Load default message if not overwritten. */
    if (!this.message) this.message = game.defaults.message || '*';

    /** See if message is correctly configured. */
    this.getMessage(game.messages, this.message);
  }

  /**
   * Validate the configuration of this game object.
   *
   * @param game active game.
   */
  prepare(game: GameService) {
    /** All referenced entities must exist. */
    for (const entity of this.entities)
      if (!game.objects.entities[entity])
        throw new Error(`${this.name}: unknown thing or person ${entity}`);

    /** Validate all actions. */
    for (const actions of Object.values(this.actions))
      actions.forEach((a) => a.validate(game, this));

    /** Prepare the dynamic entity assigments for this game object - use the set shortcut for performance reasons. */
    game.player.carriedObjects.set(this, this.entities);

    /** Set the dynamic message - but do not print it out. */
    game.execute(() => game.player.setMessage(this, this.message), true);
  }

  /**
   * Get the key of a message for this game object-
   *
   * @param message name of the message.
   */
  abstract getMessageKey(message: string): string;

  /**
   * Get the messages for a message.
   *
   * @param messages message manager instance of the active game.
   * @param message  message to look up.
   * @returns
   */
  getMessage(messages: MessagesService, message: string) {
    /** Sepcial indication for empty message. */
    if (message === '*') return;

    /** See if there are messages available and report. */
    const choices = messages.messageMap[this.getMessageKey(message)];

    if (!choices) throw new Error(`${this.name}: no message ${message}`);

    return choices;
  }
}
