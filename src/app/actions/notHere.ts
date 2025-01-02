import { Action } from '.';
import { GameObject } from '../game-object';
import { Entity } from '../game-object/entity';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

export class NotHereAction extends Action {
  public static readonly Pattern = /^if_nothere\s+([^\s]+)/;

  entity!: Entity;

  private constructor(
    public readonly what: string,
    public readonly actions: Action[]
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    return new NotHereAction(match[1], context.parseBody(match[0]));
  }

  override validate(game: GameService, scope: GameObject): void {
    this.entity = game.objects.findEntity(this.what);

    this.actions.forEach((a) => a.validate(game, scope));
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    game.debug(`test ${this.entity.key} not to be here`);

    const here = game.player.carriedObjects.has(game.player.state, this.entity);

    if (!here) Action.run(this.actions, scope, game);
  }
}
