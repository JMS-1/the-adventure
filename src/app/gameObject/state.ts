import { GameObject } from '.';
import { Action, TActionMap } from '../actions';
import { GameService } from '../services/game.service';
import { stateOperations } from './stateOperations';

export class State extends GameObject {
  exits: TActionMap = {};

  constructor(public readonly area: string, name: string) {
    super(name, null);

    if (!area) throw new Error(`state ${name} has no area`);
  }

  get key() {
    return `$$${this.area}$${this.name}`;
  }

  setExits(exits: TActionMap) {
    for (const exit of Object.keys(exits))
      if (this.exits[exit])
        throw new Error(`duplicate exit ${this.name}.${exit}`);
      else this.exits[exit] = exits[exit];
  }

  override loadDefaults(game: GameService): void {
    super.loadDefaults(game);

    for (const exit of Object.keys(game.defaults.exits))
      if (!this.exits[exit]) this.exits[exit] = game.defaults.exits[exit];

    for (const action of Object.keys(game.defaults.actions))
      if (!this.actions[action])
        this.actions[action] = game.defaults.actions[action];
  }

  override validate(game: GameService): void {
    super.validate(game);

    for (const exits of Object.values(this.exits))
      exits.forEach((a) => a.validate(game, this));
  }

  getMessageKey(message: string) {
    return `${this.area}.${this.name}_${message}`;
  }

  run(operation: stateOperations, game: GameService) {
    return Action.runAction(operation.toString(), this.actions, this, game);
  }
}
