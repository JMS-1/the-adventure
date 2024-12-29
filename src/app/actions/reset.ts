import { Action } from '.';
import { GameObject } from '../gameObject';
import { ThingOrPerson } from '../gameObject/thingOrPerson';
import { GameService } from '../services/game.service';
import { ParseContext } from '../services/parseContext';

export class ResetAction extends Action {
  public static readonly Pattern = /^reset/;

  private constructor() {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    return new ResetAction();
  }

  override validate(game: GameService, scope: GameObject): void {
    super.validate(game, scope);

    if (!(scope instanceof ThingOrPerson))
      throw new Error(`${scope.name} is not a thing or person`);
  }
}
