import { Action } from '.';
import { GameObject } from '../game-object';
import { Entity } from '../game-object/entity';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

export class DropAction extends Action {
  public static readonly Pattern = /^(@)?(#)?!([^,)\s]+)/;

  entity!: Entity;

  private constructor(
    public readonly what: string,
    public readonly silent: boolean,
    public readonly self: boolean
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    return new DropAction(match[3], !!match[1], !!match[2]);
  }

  override validate(game: GameService): void {
    this.entity = game.objects.findEntity(this.what);
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    if (this.self) {
      game.debug(
        `${this.silent ? 'silent ' : ''}${scope.key} drop ${this.entity.key}`
      );

      game.player.dropEntity(this.entity, this.silent);
    } else {
      game.dropEntity(this.entity);
    }
  }
}
