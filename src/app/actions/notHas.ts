import { Action } from '.';
import { GameObject } from '../gameObject';
import { ThingOrPerson } from '../gameObject/thingOrPerson';
import { GameService } from '../services/game.service';
import { ParseContext } from '../services/parseContext';

export class NotHasAction extends Action {
  public static readonly Pattern = /^(#)?if_nothas\s+([^\s]+)/;

  thingOrPerson?: ThingOrPerson;

  private constructor(
    public readonly what: string,
    public readonly self: boolean,
    public readonly actions: Action[]
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    return new NotHasAction(match[2], !!match[1], context.parseBody(match[0]));
  }

  override validate(game: GameService, scope: GameObject): void {
    super.validate(game, scope);

    this.thingOrPerson = game.objects.getThingOrPerson(this.what);

    this.actions.forEach((a) => a.validate(game, scope));
  }
}
