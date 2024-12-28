import { Action } from '.';
import { GameObject } from '../gameObject';
import { ThingOrPerson } from '../gameObject/thingOrPerson';
import { GameService } from '../services/game.service';
import { ParseContext } from '../services/parseContext';

export class PickAction extends Action {
  public static readonly Pattern = /^(@)?(#)?<([^,)\s]+)/;

  thingOrPerson?: ThingOrPerson;

  private constructor(
    public readonly what: string,
    public readonly silent: boolean,
    public readonly self: boolean
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    return new PickAction(match[3], !!match[1], !!match[2]);
  }

  override validate(game: GameService, scope: GameObject): void {
    super.validate(game, scope);

    this.thingOrPerson = game.objects.getThingOrPerson(this.what);
  }
}
