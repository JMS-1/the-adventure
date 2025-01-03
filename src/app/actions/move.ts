import { Action } from '.';
import { GameObject } from '../game-object';
import { Entity } from '../game-object/entity';
import { State } from '../game-object/state';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

export class MoveAction extends Action {
  public static readonly Pattern = /^(#)?>(\$\$([^$]+)\$)?([^,)\s>]+)/;

  private _target!: State;

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
    this._target =
      game.states.states[
        `$$${this.area || (scope instanceof State ? scope.area : '')}$${
          this.room
        }`
      ];

    if (!this._target) throw new Error(`${this.area}: no room ${this.room}`);

    if (this.self && !(scope instanceof Entity))
      throw new Error(`${scope.name} not a thing or person`);
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    const { player } = game;

    if (this.self) {
      game.debug(`move ${scope.key} to ${this._target.key}`);

      game.execute(
        () => player.addEntityToParent(scope as Entity, this._target),
        true
      );
    } else if (this._target !== player.state) {
      game.debug(`goto ${this._target.key}`);

      player.enterState(this._target);
    }
  }
}
