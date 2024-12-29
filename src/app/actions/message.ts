import { Action } from '.';
import { GameObject } from '../gameObject';
import { GameService } from '../services/game.service';
import { ParseContext } from '../services/parseContext';

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected override onRun(scope: GameObject, game: GameService): void {
    throw new Error(`${typeof this} not yet implemented`);
  }
}
