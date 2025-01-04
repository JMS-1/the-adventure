import { Action } from '.';
import { Entity } from '../game-object/entity';
import { Room } from '../game-object/room';
import { GameService } from '../services/game.service';
import { ParseContext } from './parse-context';

/** Remove the current entity from the game. */
export class RemoveAction extends Action {
  /** 'remove' */
  public static readonly Pattern = /^remove/;

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

    return new RemoveAction();
  }

  override validate(game: GameService, scope: Entity | Room): void {
    /** Only entities can be removed. */
    if (!(scope instanceof Entity))
      throw new Error(`${scope.name} is not a thing or person`);
  }

  protected override onRun(scope: Entity | Room, game: GameService): void {
    game.debug(`remove ${scope}}`);

    /** Make sure no timers are active. */
    game.player.stopTimers(scope as Entity);

    /** Remove from all parents - player, room or other entities. */
    game.player.detachEntity(scope as Entity);
  }
}
