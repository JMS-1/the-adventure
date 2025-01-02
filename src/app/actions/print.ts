import { Action } from '.';
import { GameObject } from '../game-object';
import { State } from '../game-object/state';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

export class PrintAction extends Action {
  public static readonly Pattern = /^&(\$\$([^$]+)\$)?([^,)\s]+)/;

  choices!: string[];

  private constructor(
    public readonly area: string | null,
    public readonly message: string
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    return new PrintAction(match[2] ?? null, match[3]);
  }

  override validate(game: GameService, scope: GameObject): void {
    const key = `${this.area || (scope instanceof State ? scope.area : '')}.${
      this.message
    }`;

    this.choices = game.messages.messageMap[key];

    if (!this.choices) throw new Error(`no message ${key}`);
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    game.debug(`print ${this.area || ''}${this.area && '.'}${this.message}`);

    game.player.printRandomMessage(this.choices);
  }
}
