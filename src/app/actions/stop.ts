import { Action } from '.';
import { GameObject } from '../game-object';
import { Entitiy } from '../game-object/entity';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

export class StopAction extends Action {
  public static readonly Pattern = /^stop/;

  private constructor() {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    return new StopAction();
  }

  override validate(game: GameService, scope: GameObject): void {
    if (!(scope instanceof Entitiy))
      throw new Error(`${scope.name} is not a thing or person`);
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    game.debug(`stop timers of ${scope.key}`);

    game.player.stopTimers(scope as Entitiy);
  }
}
