import { Action } from '.';
import { GameObject } from '../game-object';
import { GameService } from '../services/game.service';

/** Execute one of a list of actions. */
export class RandomAction extends Action {
  /**
   * Create the action.
   *
   * @param choices List of actions to choose from.
   */
  constructor(public readonly choices: Action[]) {
    super();
  }

  override validate(game: GameService, scope: GameObject): void {
    if (this.choices.length < 1) throw new Error('empty action list');

    /** Validate each action. */
    this.choices.forEach((a) => a.validate(game, scope));
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    /** Choose a random action from the list on each call. */
    const choice = Math.floor(Math.random() * this.choices.length);

    game.debug(`choose action ${choice + 1} from ${this.choices.length}`);

    Action.run([this.choices[choice]], scope, game);
  }
}
