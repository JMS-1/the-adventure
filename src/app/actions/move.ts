import { Action } from '.';
import { GameObject } from '../gameObject';
import { State } from '../gameObject/state';
import { GameService } from '../services/game.service';
import { ParseContext } from '../services/parseContext';

export class MoveAction extends Action {
  public static readonly Pattern = /^(#)?>(\$\$([^$]+)\$)?([^,)\s>]+)/;

  target?: State;

  private constructor(
    public readonly area: string | null,
    public readonly room: string,
    public readonly self: boolean
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    return new MoveAction(match[3] ?? null, match[4], !!match[1]);
  }

  override validate(game: GameService, scope: GameObject): void {
    this.target =
      game.states.states[
        `$$${this.area || (scope instanceof State ? scope.area : '')}$${
          this.room
        }`
      ];

    if (!this.target) throw new Error(`${this.area}: no room ${this.room}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected override onRun(scope: GameObject, game: GameService): void {
    throw new Error(`${typeof this} not yet implemented`);
  }
}
