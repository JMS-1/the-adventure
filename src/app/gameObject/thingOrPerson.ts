import { GameObject } from '.';
import { Action, TActionMap } from '../actions';
import { Weight } from './weight';

export abstract class ThingOrPerson extends GameObject {
  words: Set<string>;

  times: TActionMap = {};

  commands: TActionMap = {};

  weight = new Weight('(0,0,0)');

  constructor(name: string, words: string) {
    super(name);

    this.words = new Set(GameObject.parseWords(words));
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
}

export type TThingOrPersonMap<T extends ThingOrPerson> = Record<string, T>;
