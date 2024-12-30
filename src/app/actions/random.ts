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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected override onRun(scope: GameObject, game: GameService): void {
    throw new Error(
      `${
        (this as unknown as { constructor: { name: string } }).constructor.name
      } not yet implemented`
    );
  }
}
