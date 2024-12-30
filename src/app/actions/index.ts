import { GameObject } from '../gameObject';
import { GameService } from '../services/game.service';

export type TActionMap = Record<string, Action[]>;

export abstract class Action {
  abstract validate(game: GameService, scope: GameObject): void;

  protected abstract onRun(scope: GameObject, game: GameService): void;

  static run(actions: Action[], scope: GameObject, game: GameService) {
    actions.forEach((a) => game.player?.dead === false && a.onRun(scope, game));
  }

  static runAction(
    action: string,
    actions: TActionMap,
    scope: GameObject,
    game: GameService
  ) {
    return Action.run(actions[action] ?? [], scope, game);
  }
}
