import { Action } from '.';
import { GameObject } from '../game-object';
import { ThingOrPerson } from '../game-object/thingOrPerson';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

export class HereAction extends Action {
  public static readonly Pattern = /^if_here\s+([^\s]+)/;

  thingOrPerson!: ThingOrPerson;

  private constructor(
    public readonly what: string,
    public readonly actions: Action[]
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    return new HereAction(match[1], context.parseBody(match[0]));
  }

  override validate(game: GameService, scope: GameObject): void {
    this.thingOrPerson = game.objects.getThingOrPerson(this.what);

    this.actions.forEach((a) => a.validate(game, scope));
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    game.debug(`test ${this.thingOrPerson.key} to be here`);

    const here = game.player.CarriedObjects[game.player.state.key].has(
      this.thingOrPerson.key
    );

    if (here) Action.run(this.actions, scope, game);
  }
}
