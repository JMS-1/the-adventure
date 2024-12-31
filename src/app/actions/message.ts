import { Action } from '.';
import { GameObject } from '../gameObject';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

export class MessageAction extends Action {
  public static readonly Pattern = /^(@)?message\s*=\s*([^,)\s]+)/;

  private constructor(
    public readonly message: string,
    public readonly silent: boolean
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    return new MessageAction(match[2], !!match[1]);
  }

  override validate(game: GameService, scope: GameObject): void {
    scope.getMessage(game.messages, this.message);
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    game.debug(
      `set-message${this.silent ? '-silent' : ''} of ${scope.key} to ${
        this.message
      }`
    );

    game.player.setMessage(scope, this.message, this.silent, game);
  }
}
