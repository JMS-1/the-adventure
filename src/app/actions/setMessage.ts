import { Action } from '.';
import { GameObject } from '../game-object';
import { ThingOrPerson } from '../game-object/thingOrPerson';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

export class SetMessageAction extends Action {
  public static readonly Pattern = /^(@)?([^\s,)]+)\s*=\s*([^,)\s]+)/;

  thingOrPerson!: ThingOrPerson;

  private constructor(
    public readonly what: string,
    public readonly message: string,
    public readonly silent: boolean
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    return new SetMessageAction(match[2], match[3], !!match[1]);
  }

  override validate(game: GameService): void {
    this.thingOrPerson = game.objects.getThingOrPerson(this.what);

    this.thingOrPerson.getMessage(game.messages, this.message);
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    game.debug(
      `${this.silent ? 'silent ' : ''} set message of ${
        this.thingOrPerson.key
      } to ${this.message}`
    );

    game.player.setMessage(this.thingOrPerson, this.message, this.silent, game);
  }
}
