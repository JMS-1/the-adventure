import { Action } from '.';
import { Entity } from '../game-object/entity';
import { Room } from '../game-object/room';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

/** See if the player or an entity is at a specifc place. */
export class TestPositionAction extends Action {
  /** 'if_position' ' ' '$' '$' <area> '$' <room> */
  public static readonly Pattern = /^(#)?if_position\s+\$\$([^$]+)\$([^\s]+)/;

  /** State to inspect. */
  target!: Room;

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
    return new TestPositionAction(
      match[2],
      match[3],
      !!match[1],
      context.parseBody(match[0])
    );
  }

  override validate(game: GameService, scope: Entity | Room): void {
    /** Only entities can placed in rooms. */
    if (this.self && !(scope instanceof Entity))
      throw new Error(`${scope.key} not a thing or person`);

    /** See if room exists. */
    this.target = game.rooms.rooms[`$$${this.area}$${this.room}`];

    if (!this.target) throw new Error(`${this.area}: no room ${this.room}`);

    /** Check actions of body. */
    this.actions.forEach((a) => a.validate(game, scope));
  }

  protected override onRun(scope: Entity | Room, game: GameService): void {
    /** See if player or entity of this action is in the room. */
    const hit = this.self
      ? game.player.carriedObjects.has(this.target, scope as Entity)
      : this.target === game.player.room;

    game.debug(`test ${this.self ? scope.name : 'me'} at ${this.target.key}`);

    if (hit) Action.run(this.actions, scope, game);
  }
}
