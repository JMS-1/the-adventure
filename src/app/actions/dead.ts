import { Action } from '.';
import { GameObject } from '../gameObject';
import { GameService } from '../services/game.service';
import { ParseContext } from '../services/parseContext';

export class DeadAction extends Action {
  public static readonly Pattern = /^>>([^,)\s]+)/;

  message?: string[];

  private constructor(public readonly reason: string) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    return new DeadAction(match[1]);
  }

  override validate(game: GameService, scope: GameObject): void {
    super.validate(game, scope);

    this.message = game.messages.messageMap[`exit.${this.reason}`];

    if (!this.message)
      throw new Error(`${scope.name}: no message ${this.reason}`);
  }
}
