import { Action } from '.';
import { GameObject } from '../gameObject';
import { Thing } from '../gameObject/thing';
import { GameService } from '../services/game.service';
import { ParseContext } from '../services/parseContext';

export class HasThisAction extends Action {
  public static readonly Pattern = /^if_hasthis/;

  private constructor(public readonly actions: Action[]) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    return new HasThisAction(context.parseBody(match[0]));
  }

  override validate(game: GameService, scope: GameObject): void {
    if (!(scope instanceof Thing))
      throw new Error(`${scope.name} is not a thing`);

    this.actions.forEach((a) => a.validate(game, scope));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected override onRun(scope: GameObject, game: GameService): void {
    throw new Error(
      `${
        (this as unknown as { constructor: { name: string } }).constructor.name
      } not yet implemented`
    );
  }
}
