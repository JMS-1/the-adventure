import { Action } from '.';
import { GameObject } from '../game-object';
import { Entitiy } from '../game-object/entity';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

export class NotHasAction extends Action {
  public static readonly Pattern = /^(#)?if_nothas\s+([^\s]+)/;

  entity!: Entitiy;

  private constructor(
    public readonly what: string,
    public readonly self: boolean,
    public readonly actions: Action[]
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    return new NotHasAction(match[2], !!match[1], context.parseBody(match[0]));
  }

  override validate(game: GameService, scope: GameObject): void {
    this.entity = game.objects.findEntity(this.what);

    this.actions.forEach((a) => a.validate(game, scope));
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    game.debug(`test ${this.self ? scope.key : 'me'} has ${this.entity.key}`);

    const has = this.self
      ? game.player.CarriedObjects[scope.key].has(this.entity.key)
      : game.player.Inventory.has(this.entity.key);

    if (!has) Action.run(this.actions, scope, game);
  }
}
