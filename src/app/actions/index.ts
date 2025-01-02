import { GameObject } from '../game-object';
import { GameService } from '../services/game.service';

export type TActionMap = Record<string, Action[]>;

export abstract class Action {
  abstract validate(game: GameService, scope: GameObject): void;

  protected abstract onRun(scope: GameObject, game: GameService): void;

  static run(
    actions: Action[] | undefined,
    scope: GameObject,
    game: GameService
  ) {
    actions?.forEach(
      (a) => game.player?.dead === false && a.onRun(scope, game)
    );
  }
}
