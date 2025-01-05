import { Action } from '.';
import { Entity } from '../game-object/entity';
import { Room } from '../game-object/room';
import { GameService } from '../services/game.service';
import { ParseContext } from './parse-context';
import { ActionWithActions } from './with-actions';

/** See if the current game object is in a specific room. */
export class TestMessageAction extends ActionWithActions {
  /** 'if_message' ' ' <message> */
  public static readonly Pattern = /^if_message\s+([a-zA-Z0-9*äöüß_]+)/;

  /**
   * Create a new action.
   *
   * @param message to test for.
   * @param actions actions to execute on match.
   */
  private constructor(public readonly message: string, actions: Action[]) {
    super(actions);
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

  override validate(game: GameService, scope: Entity | Room): void {
    super.validate(game, scope);

    /** See if message is known. */
    scope.getMessage(game.messages, this.message);
  }

  protected override onRun(scope: Entity | Room, game: GameService): void {
    game.debug(`test message of ${scope.key} to be ${this.message}`);

    /** On match execute indicated actions from body. */
    if (this.message === game.player.messages[scope.key])
      Action.run(this.actions, scope, game);
  }
}
