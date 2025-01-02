import { Action } from '.';
import { GameObject } from '../game-object';
import { Entity } from '../game-object/entity';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

export class SetMessageAction extends Action {
  public static readonly Pattern = /^(@)?([^\s,)]+)\s*=\s*([^,)\s]+)/;

  entity!: Entity;

  private constructor(
    public readonly what: string,
    public readonly message: string,
    public readonly silent: boolean
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    return new SetMessageAction(match[2], match[3], !!match[1]);
  }

  override validate(game: GameService): void {
    this.entity = game.objects.findEntity(this.what);

    this.entity.getMessage(game.messages, this.message);
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    game.debug(
      `${this.silent ? 'silent ' : ''} set message of ${this.entity.key} to ${
        this.message
      }`
    );

    game.player.setMessage(this.entity, this.message, this.silent);
  }
}
