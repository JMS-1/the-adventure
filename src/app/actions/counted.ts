import { Action } from '.';
import { Entity } from '../game-object/entity';
import { roomOperations } from '../game-object/operations';
import { Room } from '../game-object/room';
import { GameService } from '../services/game.service';
import { ActionWithActions } from './with-actions';

/** We will only allow room operations to be counted. */
const _allowedActions: Record<roomOperations, 1> = {
  [roomOperations.enter]: 1,
  [roomOperations.exit]: 1,
  [roomOperations.stay]: 1,
};

const allowedActions = new Set(
  Object.keys(_allowedActions).map((k) => k.toString())
);

/** Allow actions to be called on specific repetitions of room operations. */
export class CountedAction extends ActionWithActions {
  constructor(
    public readonly action: string,
    public readonly counts: number[],
    actions: Action[]
  ) {
    super(actions);

    /** Make sure that only room operations are allowed. */
    if (!allowedActions.has(action))
      throw new Error(`${action} can not be counted`);
  }

  protected override onRun(scope: Entity | Room, game: GameService) {
    game.debug(
      `test ${this.action} of ${scope.key} count to be in ${JSON.stringify(
        this.counts
      )}`
    );

    /** See if the indicated count is hit. */
    if (!game.player.allowAction(scope, this.action, this.counts))
      Action.run(this.actions, scope, game);

    return true;
  }
}
