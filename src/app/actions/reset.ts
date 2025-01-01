import { Action } from '.';
import { GameObject } from '../gameObject';
import { ThingOrPerson } from '../gameObject/thingOrPerson';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

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
    if (!(scope instanceof ThingOrPerson))
      throw new Error(`${scope.name} is not a thing or person`);
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    game.debug(`reset timers of ${scope.key}`);

    game.player.stopTimers(scope as ThingOrPerson);
    game.player.startTimers(scope as ThingOrPerson);
  }
}
