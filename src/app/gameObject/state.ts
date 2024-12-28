import { GameObject } from '.';
import { TActionMap } from '../actions';

export class State extends GameObject {
  exits: TActionMap = {};

  constructor(public readonly area: string, name: string) {
    super(name);

    if (!area) throw new Error(`state ${name} has no area`);
  }

  get key() {
    return `${this.area}${this.name}`;
  }

  setExits(exits: TActionMap) {
    for (const exit of Object.keys(exits))
      if (this.exits[exit])
        throw new Error(`duplicate exit ${this.name}.${exit}`);
      else this.exits[exit] = exits[exit];
  }
}
