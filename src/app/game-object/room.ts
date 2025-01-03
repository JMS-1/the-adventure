import { GameObject } from '.';
import { Action, TActionMap } from '../actions';
import { GameService } from '../services/game.service';
import { roomOperations } from './operations';

/** Game object representing a room. */
export class Room extends GameObject {
  /** All declared exits - defaults will me merge in prior to starting the game. */
  readonly exits: TActionMap = {};

  /**
   * Create a new room.
   *
   * @param area
   * @param name
   */
  constructor(public readonly area: string, name: string) {
    super(name, null);

    if (!area) throw new Error(`room ${name} has no area`);
  }

  override get key() {
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

    for (const action of Object.keys(game.defaults.actions))
      if (!this.actions[action])
        this.actions[action] = game.defaults.actions[action];
  }

  override prepare(game: GameService): void {
    super.prepare(game);

    for (const exits of Object.values(this.exits))
      exits.forEach((a) => a.validate(game, this));

    for (const exits of Object.values(game.defaults.exits))
      exits.forEach((a) => a.validate(game, this));
  }

  getMessageKey(message: string) {
    return `${this.area}.${this.name}_${message}`;
  }

  run(operation: roomOperations, game: GameService) {
    Action.run(this.actions[operation.toString()], this, game);
  }
}
