import { Action } from '.';
import { GameObject } from '../game-object';
import { State } from '../game-object/state';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

/** See if the player or an entity is not at a specifc place. */
export class TestNotPositionAction extends Action {
  /** 'if_notposition' ' ' '$' '$' <area> '$' <room> */
  public static readonly Pattern =
    /^(#)?if_notposition\s+\$\$([^$]+)\$([^\s]+)/;

  /** State to inspect. */
  target!: State;

  /**
   * Create a new action.
   *
   * @param area area of the room.
   * @param room name of the room.
   * @param self set to test on the current entity and not the player.
   * @param actions actions to execute.
   */
  private constructor(
    public readonly area: string,
    public readonly room: string,
    public readonly self: boolean,
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
    return new TestNotPositionAction(
      match[2],
      match[3],
      !!match[1],
      context.parseBody(match[0])
    );
  }

  override validate(game: GameService, scope: GameObject): void {
    /** See if room exists. */
    this.target = game.states.states[`$$${this.area}$${this.room}`];

    if (!this.target) throw new Error(`${this.area}: no room ${this.room}`);

    /** Check actions of body. */
    this.actions.forEach((a) => a.validate(game, scope));
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    /** See if player or entity of this action is in the room. */
    const hit = this.self
      ? game.player.carriedObjects.has(this.target, scope)
      : this.target === game.player.state;

    game.debug(
      `test ${this.self ? scope.name : 'me'} not at ${this.target.key}`
    );

    if (!hit) Action.run(this.actions, scope, game);
  }
}
