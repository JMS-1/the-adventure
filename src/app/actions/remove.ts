import { Action } from '.';
import { GameObject } from '../game-object';
import { ThingOrPerson } from '../game-object/thingOrPerson';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

export class RemoveAction extends Action {
  public static readonly Pattern = /^remove/;

  private constructor() {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    return new RemoveAction();
  }

  override validate(game: GameService, scope: GameObject): void {
    if (!(scope instanceof ThingOrPerson))
      throw new Error(`${scope.name} is not a thing or person`);
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
