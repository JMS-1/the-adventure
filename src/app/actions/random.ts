import { Action } from '.';
import { Entity } from '../game-object/entity';
import { Room } from '../game-object/room';
import { GameService } from '../services/game.service';
import { ActionWithActions } from './with-actions';

/** Execute one of a list of actions. */
export class RandomAction extends ActionWithActions {
  /**
   * Create the action.
   *
   * @param actions List of actions to choose from.
   */
  constructor(actions: Action[]) {
    super(actions);
  }

  override validate(game: GameService, scope: Entity | Room): void {
    super.validate(game, scope);

    if (this.actions.length < 1) throw new Error('empty action list');
  }

  protected override onRun(scope: Entity | Room, game: GameService) {
    /** Choose a random action from the list on each call. */
    const choice = Math.floor(Math.random() * this.actions.length);

    game.debug(`choose action ${choice + 1} from ${this.actions.length}`);

    return Action.run([this.actions[choice]], scope, game);
  }
}
