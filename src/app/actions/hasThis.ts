import { Action } from '.';
import { GameObject } from '../gameObject';
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
    super.validate(game, scope);

    this.actions.forEach((a) => a.validate(game, scope));
  }
}
