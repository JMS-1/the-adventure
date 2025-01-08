import { Action } from '.';
import { Entity } from '../game-object/entity';
import { Room } from '../game-object/room';
import { GameService } from '../services/game.service';
import { ParseContext } from './parse-context';

/** Add an entity to the players inventory or another entity. */
export class PickAction extends Action {
  /** ['@'] ['#'] '<' <entity> */
  public static readonly Pattern = /^(@)?(#)?<([^,)\s]+)/;

  /** The entity to pick. */
  private _entity!: Entity;

  /**
   * Create a new action.
   *
   * @param what entity to pick up.
   * @param silent set to suppress output.
   * @param self if not set the player picks up the entity.
   */
  private constructor(
    public readonly what: string,
    public readonly silent: boolean,
    public readonly self: boolean
  ) {
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

    return new PickAction(match[3], !!match[1], !!match[2]);
  }

  override validate(game: GameService, scope: Entity | Room): void {
    /** Make sure entity exists. */
    this._entity = game.objects.findEntity(this.what);

    /** Only entities or the player can pick up entities - for rooms use the move action. */
    if (this.self && !(scope instanceof Entity))
      throw new Error(`${scope.name} is no a thing or person`);
  }

  protected override onRun(scope: Entity | Room, game: GameService) {
    if (this.self) {
      game.debug(`add ${this._entity.name} to ${scope.key}.`);

      return game.execute(
        () => (game.player.attachEntity(this._entity, scope), true),
        this.silent
      );
    }

    return game.execute(
      () => (game.pickEntity(this._entity), this.silent),
      true
    );
  }
}
