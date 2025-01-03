import { Action } from '.';
import { GameObject } from '../game-object';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

export class DeadAction extends Action {
  public static readonly Pattern = /^>>([^,)\s]+)/;

  message!: string[];

  private constructor(public readonly reason: string) {
    super();
  }

  /**
   * Analyse the call statement.
   *
   * @param match match according to out pattern.
   * @param context current parings context.
   * @returns a new action instance.
   */
  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    return new DeadAction(match[1]);
  }

  override validate(game: GameService, scope: GameObject): void {
    this.message = game.messages.messageMap[`exit.${this.reason}`];

    if (!this.message)
      throw new Error(`${scope.name}: no message ${this.reason}`);
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    game.debug(`die ${this.reason}`);

    game.output(this.message);

    game.player.dead = true;
  }
}
