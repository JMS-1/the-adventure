import { Action } from '.';
import { GameObject } from '../game-object';
import { Thing } from '../game-object/thing';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

export class NotHasThisAction extends Action {
  public static readonly Pattern = /^if_nothasthis/;

  private constructor(public readonly actions: Action[]) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    return new NotHasThisAction(context.parseBody(match[0]));
  }

  override validate(game: GameService, scope: GameObject): void {
    if (!(scope instanceof Thing))
      throw new Error(`${scope.name} is not a thing`);

    this.actions.forEach((a) => a.validate(game, scope));
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    game.debug(`test me not has ${scope.key}`);

    const has = game.player.inventory.has(scope.key);

    if (!has) Action.run(this.actions, scope, game);
  }
}
