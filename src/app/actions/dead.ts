import { Action } from '.';
import { Entity } from '../game-object/entity';
import { Room } from '../game-object/room';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

/** End the game. */
export class DeadAction extends Action {
  /** '>' '>' <message> */
  public static readonly Pattern = /^>>([^,)\s]+)/;

  /** Message to report. */
  message!: string[];

  /**
   * Create a new action
   *
   * @param reason message to report.
   */
  private constructor(public readonly reason: string) {
    super();
  }

  /**
   * Analyse the parsed statement.
   *
   * @param match match according to out pattern.
   * @param context current parings context.
   * @returns a new action instance.
   */
  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    return new DeadAction(match[1]);
  }

  override validate(game: GameService, scope: Entity | Room): void {
    /** Validate the message. */
    this.message = game.messages.messageMap[`exit.${this.reason}`];

    if (!this.message)
      throw new Error(`${scope.name}: no message ${this.reason}`);
  }

  protected override onRun(scope: Entity | Room, game: GameService): void {
    game.debug(`die ${this.reason}`);

    /** Report message not respecting silent mode. */
    game.output(this.message, true);

    /** Mark game as ended. */
    game.player.dead = true;
  }
}
