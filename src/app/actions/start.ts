import { Action } from '.';
import { Entity } from '../game-object/entity';
import { Room } from '../game-object/room';
import { GameService } from '../services/game.service';
import { ParseContext } from './parse-context';

/** Start timer of an entity. */
export class StartAction extends Action {
  /** start */
  public static readonly Pattern = /^start/;

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

    return new StartAction();
  }

  override validate(game: GameService, scope: Entity | Room): void {
    /** See if start is executed only on an entity. */
    if (!(scope instanceof Entity))
      throw new Error(`${scope.name} is not a thing or person`);
  }

  protected override onRun(scope: Entity | Room, game: GameService) {
    game.debug(`start timers of ${scope.key}`);

    game.player.startTimers(scope as Entity);

    return true;
  }
}
