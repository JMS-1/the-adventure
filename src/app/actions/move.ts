import { Action } from '.';
import { Entity } from '../game-object/entity';
import { Room } from '../game-object/room';
import { GameService } from '../services/game.service';
import { ParseContext } from './parse-context';

/** Move the player or and entity to a room. */
export class MoveAction extends Action {
  /** ['@'] ['#'] '>' ['$' '$' <area> '$'] <room> */
  public static readonly Pattern = /^(@)?(#)?>(\$\$([^$]+)\$)?([^,)\s>]+)/;

  /** The room to move to. */
  private _target!: Room;

  /**
   * Create the action.
   *
   * @param area optional area of the room - map be taken from the current room.
   * @param room room to move to.
   * @param silent set to disable output.
   * @param self set to move not the player but the entity owning this action.
   */
  private constructor(
    public readonly area: string | null,
    public readonly room: string,
    private readonly silent: boolean,
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

    return new MoveAction(match[4] ?? null, match[5], !!match[1], !!match[2]);
  }

  override validate(game: GameService, scope: Entity | Room): void {
    /** Can only move the player and entities. */
    if (this.self && !(scope instanceof Entity))
      throw new Error(`${scope.name} not a thing or person`);

    /** Validate the target room - if the current game object is a room and no area is given the area from the game object is used. */
    this._target =
      game.rooms.rooms[
        `$$${this.area || (scope instanceof Room ? scope.area : '')}$${
          this.room
        }`
      ];

    if (!this._target) throw new Error(`${this.area}: no room ${this.room}`);
  }

  protected override onRun(scope: Entity | Room, game: GameService) {
    const { player } = game;

    if (this.self) {
      /** Just place the entity in the indicated room. */
      game.debug(
        `${this.silent ? 'silent ' : ''}move ${scope.key} to ${
          this._target.key
        }`
      );

      return game.execute(
        () => (player.attachEntity(scope as Entity, this._target), true),
        this.silent
      );
    }

    player.enterRoom(this._target);

    return false;
  }
}
