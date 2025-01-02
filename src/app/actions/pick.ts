import { Action } from '.';
import { GameObject } from '../game-object';
import { ThingOrPerson } from '../game-object/thingOrPerson';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

export class PickAction extends Action {
  public static readonly Pattern = /^(@)?(#)?<([^,)\s]+)/;

  private _thingOrPerson!: ThingOrPerson;

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
    this._thingOrPerson = game.objects.getThingOrPerson(this.what);

    if (this.self && !(scope instanceof ThingOrPerson))
      throw new Error(`${scope.name} is no a thing or person`);
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    if (this.self) {
      game.debug(`add ${this._thingOrPerson.name} to ${scope.key}.`);

      game.player.addThingOrPersonToCarrier(this._thingOrPerson, scope, true);
    } else {
      game.pickThingOrPerson(this._thingOrPerson);
    }
  }
}
