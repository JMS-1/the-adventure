import { Action } from '.';
import { GameObject } from '../game-object';
import { Entitiy } from '../game-object/entity';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

export class TestStateAction extends Action {
  public static readonly Pattern = /^if_state\s+([^\s]+)\s+([^\s]+)/;

  entity!: Entitiy;

  private constructor(
    public readonly what: string,
    public readonly message: string,
    public readonly actions: Action[]
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    return new TestStateAction(match[1], match[2], context.parseBody(match[0]));
  }

  override validate(game: GameService, scope: GameObject): void {
    this.entity = game.objects.findEntity(this.what);

    this.entity.getMessage(game.messages, this.message);

    this.actions.forEach((a) => a.validate(game, scope));
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    game.debug(`test message of ${this.entity.key} to be ${this.message}`);

    if (this.message === game.player.Messages[this.entity.key])
      Action.run(this.actions, scope, game);
  }
}
