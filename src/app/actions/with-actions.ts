import { Action } from '.';
import { Entity } from '../game-object/entity';
import { Room } from '../game-object/room';
import { GameService } from '../services/game.service';

/** Some action containting a list of actions. */
export abstract class ActionWithActions extends Action {
  /**
   * Initialize the action.
   *
   * @param actions List of actions manage.
   */
  constructor(public readonly actions: Action[]) {
    super();
  }

  override validate(game: GameService, scope: Entity | Room): void {
    /** Validate each action. */
    this.actions.forEach((a) => a.validate(game, scope));
  }
}
