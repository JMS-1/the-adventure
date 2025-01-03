import { Entity } from '../game-object/entity';
import { Room } from '../game-object/room';
import { GameService } from '../services/game.service';

/** Map of actions */
export type TActionMap = Record<string, Action[]>;

/** Singe action. */
export abstract class Action {
  /**
   * Validate the action configuration.
   *
   * @param game active game.
   * @param scope current game object validated.
   */
  abstract validate(game: GameService, scope: Entity | Room): void;

  /**
   * Execute the action.
   *
   * @param scope current game object executing the action.
   * @param game active game.
   */
  protected abstract onRun(scope: Entity | Room, game: GameService): void;

  /**
   * Run a list of actions.
   *
   * @param actions actions to execute.
   * @param scope game object repsonsible for the action.
   * @param game active game.
   */
  static run(
    actions: Action[] | undefined,
    scope: Entity | Room,
    game: GameService
  ) {
    /** Stop as soon as the player died. */
    actions?.forEach((a) => game.player.dead === false && a.onRun(scope, game));
  }
}
