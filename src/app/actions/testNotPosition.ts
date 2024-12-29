import { Action } from '.';
import { GameObject } from '../gameObject';
import { State } from '../gameObject/state';
import { GameService } from '../services/game.service';
import { ParseContext } from '../services/parseContext';

export class TestNotPositionAction extends Action {
  public static readonly Pattern =
    /^(#)?if_notposition\s+\$\$([^$]+)\$([^\s]+)/;

  target?: State;

  private constructor(
    public readonly area: string,
    public readonly room: string,
    public readonly self: boolean,
    public readonly actions: Action[]
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    return new TestNotPositionAction(
      match[2],
      match[3],
      !!match[1],
      context.parseBody(match[0])
    );
  }

  override validate(game: GameService, scope: GameObject): void {
    super.validate(game, scope);

    this.target = game.states.states[`$$${this.area}$${this.room}`];

    if (!this.target) throw new Error(`${this.area}: no room ${this.room}`);

    this.actions.forEach((a) => a.validate(game, scope));
  }
}
