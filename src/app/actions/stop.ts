import { Action } from '.';
import { GameObject } from '../game-object';
import { Entity } from '../game-object/entity';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

/** Stop all timers of an entity. */
export class StopAction extends Action {
  /** stop */
  public static readonly Pattern = /^stop/;

  /** Create a new action. */
  private constructor() {
    super();
  }

  /**
   * Analyse the parsed statement.
   *
   * @param match match according to out pattern.
   * @param context current parings context.
   * @returns a new action instance.
   */
  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    return new StopAction();
  }

  override validate(game: GameService, scope: GameObject): void {
    /** See if stop is executed only on an entity. */
    if (!(scope instanceof Entity))
      throw new Error(`${scope.name} is not a thing or person`);
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    game.debug(`stop timers of ${scope.key}`);

    game.player.stopTimers(scope as Entity);
  }
}
