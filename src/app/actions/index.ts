import { GameObject } from '../gameObject';
import { GameService } from '../services/game.service';

export type TActionMap = Record<string, Action[]>;

export abstract class Action {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  validate(game: GameService, scope: GameObject): void {}
}
