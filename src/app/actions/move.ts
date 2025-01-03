import { Action } from '.';
import { GameObject } from '../game-object';
import { Entity } from '../game-object/entity';
import { State } from '../game-object/state';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

/** Move the player or and entity to a room. */
export class MoveAction extends Action {
  /** ['#'] '>' ['$' '$' <area> '$'] <room> */
  public static readonly Pattern = /^(#)?>(\$\$([^$]+)\$)?([^,)\s>]+)/;

  /** The room to move to. */
  private _target!: State;

  /**
   * Create the action.
   *
   * @param area optional area of the room - map be taken from the current state.
   * @param room room to move to.
   * @param self set to move not the player but the entity owning this action.
   */
  private constructor(
    public readonly area: string | null,
    public readonly room: string,
    public readonly self: boolean
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

    return new MoveAction(match[3] ?? null, match[4], !!match[1]);
  }

  override validate(game: GameService, scope: GameObject): void {
    /** Can only move the player and entities. */
    if (this.self && !(scope instanceof Entity))
      throw new Error(`${scope.name} not a thing or person`);

    /** Validate the target room - if the current game object is a room and no area is given the area from the game object is used. */
    this._target =
      game.states.states[
        `$$${this.area || (scope instanceof State ? scope.area : '')}$${
          this.room
        }`
      ];

    if (!this._target) throw new Error(`${this.area}: no room ${this.room}`);
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    const { player } = game;

    if (this.self) {
      /** Just place the entity in the indicated room. */
      game.debug(`move ${scope.key} to ${this._target.key}`);

      game.execute(
        () => player.addEntityToParent(scope as Entity, this._target),
        true
      );
    } else {
      /** Move the player to the indicated state. */
      game.debug(`goto ${this._target.key}`);

      player.enterState(this._target);
    }
  }
}
