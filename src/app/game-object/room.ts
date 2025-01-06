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
   * @param area area of the room.
   * @param name unique name of the room inside the area.
   */
  constructor(public readonly area: string, name: string) {
    super(name, null);

    if (!area) throw new Error(`room ${name} has no area`);
  }

  override get self() {
    return this;
  }

  /** Get global unique name if the room. */
  override get key() {
    return `$$${this.area}$${this.name}`;
  }

  /**
   * Define additional exits from the room.
   *
   * @param exits list of exits to add - duplicate declaration
   * will throw an error.
   */
  addExits(exits: TActionMap) {
    for (const exit of Object.keys(exits)) {
      const actions = exits[exit];

      for (const key of exit)
        this.exits[key] = [...(this.exits[key] || []), ...actions];
    }
  }

  override loadDefaults(game: GameService): void {
    super.loadDefaults(game);

    /** Merge in all default actions. */
    for (const action of Object.keys(game.defaults.actions))
      this.actions[action] = [
        ...game.defaults.actions[action],
        ...(this.actions[action] || []),
      ];
  }

  override prepare(game: GameService): void {
    super.prepare(game);

    /** Validate all exits - either directly declared or inherited as default. */
    for (const exits of Object.values(this.exits))
      exits.forEach((a) => a.validate(game, this));

    for (const exits of Object.values(game.defaults.exits))
      exits.forEach((a) => a.validate(game, this));
  }

  /**
   * Get the unique identifier of a message for this room.
   *
   * @param message message to look up.
   * @returns the key to the message.
   */
  getMessageKey(message: string) {
    return `${this.area}.${this.name}_${message}`;
  }

  /**
   * Run a room operation.
   *
   * @param operation operation to execute.
   * @param game active game.
   */
  run(operation: roomOperations, game: GameService) {
    const action = operation.toString();

    /** Adjust counter to allow action called on various stages of the game. */
    game.player.incrementActionCounter(this.self, action);

    if (operation === roomOperations.enter)
      game.player.resetActionCounter(this.self, roomOperations.stay.toString());

    Action.run(this.actions[action], this, game);
  }
}
