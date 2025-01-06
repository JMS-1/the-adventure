import { Action } from '.';
import { Entity } from '../game-object/entity';
import { Room } from '../game-object/room';
import { GameService } from '../services/game.service';
import { ParseContext } from './parse-context';

/** Restart all timers. */
export class ResetAction extends Action {
  /** reset */
  public static readonly Pattern = /^reset/;

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

    return new ResetAction();
  }

  override validate(game: GameService, scope: Entity | Room): void {
    /** See if reset is executed only on an entity. */
    if (!(scope instanceof Entity))
      throw new Error(`${scope.name} is not a thing or person`);
  }

  protected override onRun(scope: Entity | Room, game: GameService) {
    game.debug(`reset timers of ${scope.key}`);

    /** Remove all timers and start it again. */
    game.player.stopTimers(scope as Entity);
    game.player.startTimers(scope as Entity);

    return true;
  }
}
