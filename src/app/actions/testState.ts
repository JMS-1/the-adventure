import { Action } from '.';
import { GameObject } from '../gameObject';
import { ThingOrPerson } from '../gameObject/thingOrPerson';
import { GameService } from '../services/game.service';
import { ParseContext } from '../services/parseContext';

export class TestStateAction extends Action {
  public static readonly Pattern = /^if_state\s+([^\s]+)\s+([^\s]+)/;

  thingOrPerson?: ThingOrPerson;

  private constructor(
    public readonly what: string,
    public readonly message: string,
    public readonly actions: Action[]
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    return new TestStateAction(match[1], match[2], context.parseBody(match[0]));
  }

  override validate(game: GameService, scope: GameObject): void {
    super.validate(game, scope);

    this.thingOrPerson = game.objects.getThingOrPerson(this.what);

    this.thingOrPerson.getMessage(game.messages, this.message);

    this.actions.forEach((a) => a.validate(game, scope));
  }
}
