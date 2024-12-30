import { Action } from '.';
import { GameObject } from '../gameObject';
import { ThingOrPerson } from '../gameObject/thingOrPerson';
import { GameService } from '../services/game.service';
import { ParseContext } from '../services/parseContext';

export class StartAction extends Action {
  public static readonly Pattern = /^start/;

  private constructor() {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    return new StartAction();
  }

  override validate(game: GameService, scope: GameObject): void {
    if (!(scope instanceof ThingOrPerson))
      throw new Error(`${scope.name} is not a thing or person`);
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    game.debug(`start-timers of ${scope.key}`);

    game.player.startTimers(scope as ThingOrPerson, game);
  }
}
