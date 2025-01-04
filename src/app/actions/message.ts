import { Action } from '.';
import { Entity } from '../game-object/entity';
import { Room } from '../game-object/room';
import { GameService } from '../services/game.service';
import { ParseContext } from './parse-context';

/** Set the message of a game object. */
export class MessageAction extends Action {
  /** ['@'] 'message' '=' <message> */
  public static readonly Pattern = /^(@)?message\s*=\s*([^,)\s]+)/;

  /**
   * Create the action to set.
   *
   * @param message message to set.
   * @param silent set to supress output of the mew message.
   */
  private constructor(
    public readonly message: string,
    public readonly silent: boolean
  ) {
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

    return new MessageAction(match[2], !!match[1]);
  }

  override validate(game: GameService, scope: Entity | Room): void {
    /** Make sure the message is defined. */
    scope.getMessage(game.messages, this.message);
  }

  protected override onRun(scope: Entity | Room, game: GameService): void {
    game.debug(
      `${this.silent ? 'silent ' : ''} set message of ${scope.key} to ${
        this.message
      }`
    );

    game.execute(
      () => game.player.setMessage(scope, this.message),
      this.silent
    );
  }
}
