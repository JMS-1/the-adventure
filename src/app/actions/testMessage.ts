import { Action } from '.';
import { GameObject } from '../gameObject';
import { GameService } from '../services/game.service';
import { ParseContext } from '../services/parseContext';

export class TestMessageAction extends Action {
  public static readonly Pattern = /^if_message\s+([^\s]+)/;

  private constructor(
    public readonly message: string,
    public readonly actions: Action[]
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    return new TestMessageAction(match[1], context.parseBody(match[0]));
  }

  override validate(game: GameService, scope: GameObject): void {
    scope.getMessage(game.messages, this.message);

    this.actions.forEach((a) => a.validate(game, scope));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected override onRun(scope: GameObject, game: GameService): void {
    throw new Error(`${typeof this} not yet implemented`);
  }
}
