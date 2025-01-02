import { Action } from '.';
import { GameObject } from '../game-object';
import { Entitiy } from '../game-object/entity';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

export class RemoveAction extends Action {
  public static readonly Pattern = /^remove/;

  private constructor() {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    return new RemoveAction();
  }

  override validate(game: GameService, scope: GameObject): void {
    if (!(scope instanceof Entitiy))
      throw new Error(`${scope.name} is not a thing or person`);
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    game.debug(`remove ${scope}}`);

    game.player.stopTimers(scope as Entitiy);

    game.player.dropEntity(scope as Entitiy, true);
  }
}
