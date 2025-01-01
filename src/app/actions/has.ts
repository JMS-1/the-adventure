import { Action } from '.';
import { GameObject } from '../game-object';
import { ThingOrPerson } from '../game-object/thingOrPerson';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

export class HasAction extends Action {
  public static readonly Pattern = /^(#)?if_has\s+([^\s]+)/;

  thingOrPerson?: ThingOrPerson;

  private constructor(
    public readonly what: string,
    public readonly self: boolean,
    public readonly actions: Action[]
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    return new HasAction(match[2], !!match[1], context.parseBody(match[0]));
  }

  override validate(game: GameService, scope: GameObject): void {
    this.thingOrPerson = game.objects.getThingOrPerson(this.what);

    this.actions.forEach((a) => a.validate(game, scope));
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
