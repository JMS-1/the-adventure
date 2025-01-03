import { Action } from '.';
import { GameObject } from '../game-object';
import { Entity } from '../game-object/entity';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

export class PickAction extends Action {
  public static readonly Pattern = /^(@)?(#)?<([^,)\s]+)/;

  private _entity!: Entity;

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

  override validate(game: GameService, scope: GameObject): void {
    this._entity = game.objects.findEntity(this.what);

    if (this.self && !(scope instanceof Entity))
      throw new Error(`${scope.name} is no a thing or person`);
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    if (this.self) {
      game.debug(`add ${this._entity.name} to ${scope.key}.`);

      game.execute(
        () => game.player.addEntityToParent(this._entity, scope),
        true
      );
    } else {
      game.pickEntity(this._entity);
    }
  }
}
