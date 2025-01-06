import { Action } from '.';
import { Entity } from '../game-object/entity';
import { Room } from '../game-object/room';
import { GameService } from '../services/game.service';
import { ParseContext } from './parse-context';

/** Just print a message. */
export class PrintAction extends Action {
  /** '&' ['&' '&' <area> '&'] <message>*/
  public static readonly Pattern = /^&(\$\$([^$]+)\$)?([^,)\s]+)/;

  /** Message to display. */
  choices!: string[];

  /**
   * Create a new action.
   *
   * @param area optional area - not needed if action belongs to a room.
   * @param message message to display.
   */
  private constructor(
    public readonly area: string | null,
    public readonly message: string
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

    return new PrintAction(match[2] ?? null, match[3]);
  }

  override validate(game: GameService, scope: Entity | Room): void {
    /** Get the fill key of the message - area may come from the room. */
    const key = `${this.area || (scope instanceof Room ? scope.area : '')}.${
      this.message
    }`;

    this.choices = game.messages.messageMap[key];

    /** Validate message. */
    if (!this.choices) throw new Error(`no message ${key}`);
  }

  protected override onRun(scope: Entity | Room, game: GameService) {
    game.debug(`print ${this.area || ''}${this.area && '.'}${this.message}`);

    game.player.printRandomMessage(this.choices);

    return true;
  }
}
