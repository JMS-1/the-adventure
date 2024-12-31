import { Action } from '.';
import { GameObject } from '../gameObject';
import { ThingOrPerson } from '../gameObject/thingOrPerson';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

export class SetMessageAction extends Action {
  public static readonly Pattern = /^(@)?([^\s,)]+)\s*=\s*([^,)\s]+)/;

  thingOrPerson?: ThingOrPerson;

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected override onRun(scope: GameObject, game: GameService): void {
    throw new Error(
      `${
        (this as unknown as { constructor: { name: string } }).constructor.name
      } not yet implemented`
    );
  }
}
