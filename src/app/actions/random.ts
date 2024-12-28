import { Action } from '.';
import { GameObject } from '../gameObject';
import { GameService } from '../services/game.service';

export class RandomAction extends Action {
  constructor(public readonly choices: Action[]) {
    super();
  }

  override validate(game: GameService, scope: GameObject): void {
    super.validate(game, scope);

    this.choices.forEach((a) => a.validate(game, scope));
  }
}
