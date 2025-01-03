import { Action } from '.';
import { GameObject } from '../game-object';
import { Entity } from '../game-object/entity';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

/** See if any entity is in an indicated state. */
export class TestStateAction extends Action {
  /** 'if_state' <entity> <message> */
  public static readonly Pattern = /^if_state\s+([^\s]+)\s+([^\s]+)/;

  /** The entity of interest. */
  entity!: Entity;

  /**
   * Create a new action.
   *
   * @param what entity to use.
   * @param message message to test on.
   * @param actions actions to execute.
   */
  private constructor(
    public readonly what: string,
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
    return new TestStateAction(match[1], match[2], context.parseBody(match[0]));
  }

  override validate(game: GameService, scope: GameObject): void {
    /** Validate entity and make sure state is known. */
    this.entity = game.objects.findEntity(this.what);

    this.entity.getMessage(game.messages, this.message);

    /** Validate all actions as well. */
    this.actions.forEach((a) => a.validate(game, scope));
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    game.debug(`test message of ${this.entity.key} to be ${this.message}`);

    /** On match execute the actions from the body. */
    if (this.message === game.player.messages[this.entity.key])
      Action.run(this.actions, scope, game);
  }
}
