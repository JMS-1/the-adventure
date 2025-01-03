import { Action } from '.';
import { GameObject } from '../game-object';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

/** See if the current game object is in a specific state. */
export class TestMessageAction extends Action {
  /** 'if_message' ' ' <message> */
  public static readonly Pattern = /^if_message\s+([^\s]+)/;

  /**
   * Create a new action.
   *
   * @param message state to test for.
   * @param actions actions to execute on match.
   */
  private constructor(
    public readonly message: string,
    public readonly actions: Action[]
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
    return new TestMessageAction(match[1], context.parseBody(match[0]));
  }

  override validate(game: GameService, scope: GameObject): void {
    /** See if message is known. */
    scope.getMessage(game.messages, this.message);

    /** Validate actions in body as well. */
    this.actions.forEach((a) => a.validate(game, scope));
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    game.debug(`test message of ${scope.key} to be ${this.message}`);

    /** On match execute indicated actions from body. */
    if (this.message === game.player.messages[scope.key])
      Action.run(this.actions, scope, game);
  }
}
