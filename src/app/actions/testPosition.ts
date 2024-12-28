import { Action } from '.';
import { GameObject } from '../gameObject';
import { GameService } from '../services/game.service';
import { ParseContext } from '../services/parseContext';

export class TestPositionAction extends Action {
  public static readonly Pattern = /^(#)?if_position\s+\$\$([^$]+)\$([^\s]+)/;

  private constructor(
    public readonly area: string,
    public readonly room: string,
    public readonly self: boolean,
    public readonly actions: Action[]
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    return new TestPositionAction(
      match[2],
      match[3],
      !!match[1],
      context.parseBody(match[0])
    );
  }

  override validate(game: GameService, scope: GameObject): void {
    super.validate(game, scope);

    this.actions.forEach((a) => a.validate(game, scope));
  }
}
