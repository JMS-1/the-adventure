import { Action } from '.';
import { GameObject } from '../game-object';
import { Entity } from '../game-object/entity';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

export class StartAction extends Action {
  public static readonly Pattern = /^start/;

  private constructor() {
    super();
  }

  /**
   * Analyse the call statement.
   *
   * @param match match according to out pattern.
   * @param context current parings context.
   * @returns a new action instance.
   */
  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    return new StartAction();
  }

  override validate(game: GameService, scope: GameObject): void {
    if (!(scope instanceof Entity))
      throw new Error(`${scope.name} is not a thing or person`);
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    game.debug(`start timers of ${scope.key}`);

    game.player.startTimers(scope as Entity);
  }
}
