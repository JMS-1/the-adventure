import { Action } from '.';
import { Entity } from '../game-object/entity';
import { Room } from '../game-object/room';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

/** Set a message on any entity. */
export class SetMessageAction extends Action {
  /** ['@']<entity> '=' <message> */
  public static readonly Pattern = /^(@)?([^\s,)]+)\s*=\s*([^,)\s]+)/;

  /** The entity to change. */
  entity!: Entity;

  /**
   * Create a new action.
   *
   * @param what name of the entity.
   * @param message message to use.
   * @param silent set to suppress output.
   */
  private constructor(
    public readonly what: string,
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

    return new SetMessageAction(match[2], match[3], !!match[1]);
  }

  override validate(game: GameService): void {
    /** Resolve the entity. */
    this.entity = game.objects.findEntity(this.what);

    /** Test if the message exists. */
    this.entity.getMessage(game.messages, this.message);
  }

  protected override onRun(scope: Entity | Room, game: GameService): void {
    game.debug(
      `${this.silent ? 'silent ' : ''} set message of ${this.entity.key} to ${
        this.message
      }`
    );

    game.execute(
      () => game.player.setMessage(this.entity, this.message),
      this.silent
    );
  }
}
