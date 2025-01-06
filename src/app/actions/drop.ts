import { Action } from '.';
import { Entity } from '../game-object/entity';
import { Room } from '../game-object/room';
import { GameService } from '../services/game.service';
import { ParseContext } from './parse-context';

/** Drop some entity. */
export class DropAction extends Action {
  /** ['@'] ['#'] ! <entity> */
  public static readonly Pattern = /^(@)?(#)?!([^,)\s]+)/;

  /** Entity to drop. */
  entity!: Entity;

  /**
   * Create a new action.
   *
   * @param what entity to drop.
   * @param silent set to suppress any output.
   * @param self not set if the entity is in the players inventory.
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

    return new DropAction(match[3], !!match[1], !!match[2]);
  }

  override validate(game: GameService): void {
    /** Make sure entity exists. */
    this.entity = game.objects.findEntity(this.what);
  }

  protected override onRun(scope: Entity | Room, game: GameService) {
    if (this.self) {
      game.debug(
        `${this.silent ? 'silent ' : ''}${scope.key} drop ${this.entity.key}`
      );

      game.execute(
        () => game.player.attachEntity(this.entity, game.player.room),
        this.silent
      );
    } else {
      game.execute(() => game.dropEntity(this.entity), this.silent);
    }

    return true;
  }
}
