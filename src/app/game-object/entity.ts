import { GameObject } from '.';
import { Action, TActionMap } from '../actions';
import { GameService } from '../services/game.service';
import { Macro } from './macro';
import { systemShortcuts } from './shortcuts';
import { Weight } from './weight';

/** ['+'] <0 to 999> */
const timeKeyReg = /^(\+)?(\d{1,3})$/;

/** Entities are game objects which are either persons ot things. */
export abstract class Entity extends GameObject {
  /** All the names of the entity which can be used in commands to adress it. */
  readonly words: Set<string>;

  /** All the timers declared for this entity. */
  readonly times: TActionMap = {};

  /** Entities may have commands direcly available in the input of the user. */
  readonly commands: TActionMap = {};

  /** Configured weight of the entity. */
  weight = new Weight('(0,0,0)');

  /**
   * Initialize a new entity.
   *
   * @param name unique name of the entity.
   * @param words words used to address the entity.
   * @param macro macro to clone entity from.
   */
  constructor(name: string, words: string, macro: Macro | null) {
    super(name, macro);

    this.words = new Set(GameObject.parseWords(words));

    if (macro) {
      this.commands = { ...macro.commands };
      this.times = { ...macro.times };
      this.weight = macro.weight;
    }
  }

  /**
   * Set the configured weight of this entity.
   *
   * @param weight the weight.
   */
  setWeight(weight: string) {
    this.weight = new Weight(weight);
  }

  /**
   * Add a list of timers to this game object.
   *
   * @param times list of timers, each with a unique key and a list of actions.
   */
  addTimes(times: TActionMap) {
    for (const time of Object.keys(times)) {
      /** Check for supported pattern - may be either an interval or a one-shot time. */
      const match = timeKeyReg.exec(time);

      if (!match) throw new Error(`${this.name}: invalid time ${time}`);

      /** Currently we can only have on list of actions per key. */
      if (this.times[time])
        throw new Error(`${this.name}: duplicate time ${time}`);

      this.times[time] = times[time];
    }
  }

  /**
   * Add a single command to the entity.
   *
   * @param command name of the command.
   * @param actions list of actions.
   */
  addCommand(command: string, actions: Action[]) {
    /** Each command can only defined once. */
    if (this.commands[command])
      throw new Error(`duplicate command ${this.name}.${command}`);
    else this.commands[command] = actions;
  }

  override prepare(game: GameService): void {
    super.prepare(game);

    /** All declared commands. */
    for (const commands of Object.values(this.commands))
      commands.forEach((a) => a.validate(game, this));

    /** Commands from the default list - used if not overwriten. */
    for (const commands of Object.values(game.defaults.commands))
      commands.forEach((a) => a.validate(game, this));

    /** All actions configured for timers. */
    for (const times of Object.values(this.times))
      times.forEach((a) => a.validate(game, this));
  }

  override getMessageKey(message: string) {
    /** All things and persons share the message area things. */
    return `things.${this.name}_${message}`;
  }

  /**
   * Run a given command.
   *
   * @param command name of the command.
   * @param game active game.
   */
  runCommand(command: string, game: GameService) {
    /** If commmand is not defined explicitly for this entity check the default commands as well. */
    return Action.run(
      this.commands[command] ?? game.defaults.commands[command],
      this,
      game
    );
  }

  /**
   * Execute a system command defined in the defaults configuration.
   *
   * @param key command to execute.
   * @param game active game.
   */
  runSystemCommand(key: systemShortcuts, game: GameService) {
    const keyString = key.toString();

    /** Find the command name from the shortcut and run the command. */
    for (const command of Object.keys(game.defaults.keyMap))
      if (game.defaults.keyMap[command] === keyString)
        return this.runCommand(command, game);
  }
}

/** Map of entities. */
export type EntityMap<T extends Entity> = Record<string, T>;
