import { Action } from '.';
import { Entity } from '../game-object/entity';
import { Room } from '../game-object/room';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

/** See if the player holds an entity. */
export class HasThisAction extends Action {
  /** 'if_hasthis' */
  public static readonly Pattern = /^if_hasthis/;

  /**
   * Create the action.
   *
   * @param actions list of actions to execute.
   */
  private constructor(public readonly actions: Action[]) {
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
    return new HasThisAction(context.parseBody(match[0]));
  }

  override validate(game: GameService, scope: Entity | Room): void {
    /** Can only carry entities. */
    if (!(scope instanceof Entity))
      throw new Error(`${scope.name} is not a thing or person`);

    /** Validate all actions in body. */
    this.actions.forEach((a) => a.validate(game, scope));
  }

  protected override onRun(scope: Entity | Room, game: GameService): void {
    game.debug(`test me has ${scope.key}`);

    /** See if we are carrying the entity and proceed as necessary. */
    const has = game.player.inventory.has(scope.key);

    if (has) Action.run(this.actions, scope, game);
  }
}
