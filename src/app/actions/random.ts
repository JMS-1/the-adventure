import { Action } from '.';
import { GameObject } from '../gameObject';
import { GameService } from '../services/game.service';

export class RandomAction extends Action {
  constructor(public readonly choices: Action[]) {
    super();
  }

  override validate(game: GameService, scope: GameObject): void {
    this.choices.forEach((a) => a.validate(game, scope));
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    const choice = Math.floor(Math.random() * this.choices.length);

    game.debug(`choose action ${choice + 1} from ${this.choices.length}`);

    Action.run(this.choices.slice(choice, choice + 1), scope, game);
  }
}
