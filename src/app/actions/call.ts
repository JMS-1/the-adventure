import { Action } from '.';
import { GameObject } from '../gameObject';
import { ThingOrPerson } from '../gameObject/thingOrPerson';
import { GameService } from '../services/game.service';
import { ParseContext } from '../services/parseContext';

export class CallAction extends Action {
  public static readonly Pattern = /^(@)?([^\s,)=]+)\s+([^\s,)=]+)/;

  thingOrPerson?: ThingOrPerson;

  actions?: Action[];

  private constructor(
    public readonly what: string,
    public readonly action: string,
    public readonly silent: boolean
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    return new CallAction(match[2], match[3], !!match[1]);
  }

  override validate(game: GameService, scope: GameObject): void {
    super.validate(game, scope);

    this.thingOrPerson = game.objects.getThingOrPerson(this.what);
    this.actions = this.thingOrPerson.actions[this.action];

    if (!this.actions)
      throw new Error(`${this.what}: no action ${this.action}`);
  }
}
