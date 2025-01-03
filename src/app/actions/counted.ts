import { Action } from '.';
import { Entity } from '../game-object/entity';
import { Room } from '../game-object/room';
import { GameService } from '../services/game.service';

export class CountedAction extends Action {
  constructor(
    public readonly action: string,
    public readonly counts: number[],
    public readonly actions: Action[]
  ) {
    super();
  }

  override validate(game: GameService, scope: Entity | Room): void {
    this.actions.forEach((a) => a.validate(game, scope));
  }

  protected override onRun(scope: Entity | Room, game: GameService): void {
    game.debug(`counted`);

    Action.run(this.actions, scope, game);
  }
}
