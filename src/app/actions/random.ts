import { Action } from '.';
import { GameObject } from '../gameObject';
import { GameService } from '../services/game.service';

export class RandomAction extends Action {
  constructor(private readonly _choices: Action[]) {
    super();
  }

  override validate(game: GameService, scope: GameObject): void {
    this._choices.forEach((a) => a.validate(game, scope));
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    const choice = Math.floor(Math.random() * this._choices.length);

    game.debug(`choose action ${choice + 1} from ${this._choices.length}`);

    Action.run(this._choices.slice(choice, choice + 1), scope, game);
  }
}
