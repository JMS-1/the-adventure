import { GameObject } from '.';
import { Action, TActionMap } from '../actions';
import { GameService } from '../services/game.service';
import { Macro } from './macro';
import { Weight } from './weight';

export abstract class ThingOrPerson extends GameObject {
  words: Set<string>;

  times: TActionMap = {};

  commands: TActionMap = {};

  weight = new Weight('(0,0,0)');

  constructor(name: string, words: string, macro: Macro | null) {
    super(name, macro);

    this.words = new Set(GameObject.parseWords(words));

    if (macro) {
      this.commands = { ...macro.commands };
      this.times = { ...macro.times };
      this.weight = macro.weight;
    }
  }

  setWeight(weight: string) {
    this.weight = new Weight(weight);
  }

  setTimes(times: TActionMap) {
    for (const time of Object.keys(times))
      if (this.times[time])
        throw new Error(`duplicate time ${this.name}.${time}`);
      else this.times[time] = times[time];
  }

  addCommand(command: string, actions: Action[]) {
    if (this.commands[command])
      throw new Error(`duplicate command ${this.name}.${command}`);
    else this.commands[command] = actions;
  }

  override validate(game: GameService): void {
    super.validate(game);

    for (const commands of Object.values(this.commands))
      commands.forEach((a) => a.validate(game, this));

    for (const times of Object.values(this.times))
      times.forEach((a) => a.validate(game, this));
  }

  override getMessageKey(message: string) {
    return `things.${this.name}_${message}`;
  }
}

export type TThingOrPersonMap<T extends ThingOrPerson> = Record<string, T>;