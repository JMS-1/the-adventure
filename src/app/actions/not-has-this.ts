import { Action } from '.';
import { Entity } from '../game-object/entity';
import { Room } from '../game-object/room';
import { GameService } from '../services/game.service';
import { ParseContext } from './parse-context';
import { ActionWithActions } from './with-actions';

/** See if the player does not hold an entity. */
export class NotHasThisAction extends ActionWithActions {
  /** 'if_nothasthis' */
  public static readonly Pattern = /^if_nothasthis/;

  /**
   * Create the action.
   *
   * @param actions list of actions to execute.
   */
  private constructor(actions: Action[]) {
    super(actions);
  }

  /**
   * Analyse the parsed statement.
   *
   * @param match match according to out pattern.
   * @param context current parings context.
   * @returns a new action instance.
   */
  static parse(match: RegExpMatchArray, context: ParseContext) {
    return new NotHasThisAction(context.parseBody(match[0]));
  }

  override validate(game: GameService, scope: Entity | Room): void {
    super.validate(game, scope);

    /** Can only carry entities. */
    if (!(scope instanceof Entity))
      throw new Error(`${scope.name} is not a thing or person`);
  }

  protected override onRun(scope: Entity | Room, game: GameService): void {
    game.debug(`test me not has ${scope.key}`);

    /** See if we are carrying the entity and proceed as necessary. */
    const has = game.player.inventory.has(scope.key);

    if (!has) Action.run(this.actions, scope, game);
  }
}
