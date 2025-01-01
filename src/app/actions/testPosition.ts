import { Action } from '.';
import { GameObject } from '../gameObject';
import { State } from '../gameObject/state';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

export class TestPositionAction extends Action {
  public static readonly Pattern = /^(#)?if_position\s+\$\$([^$]+)\$([^\s]+)/;

  target!: State;

  private constructor(
    public readonly area: string,
    public readonly room: string,
    public readonly self: boolean,
    public readonly actions: Action[]
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    return new TestPositionAction(
      match[2],
      match[3],
      !!match[1],
      context.parseBody(match[0])
    );
  }

  override validate(game: GameService, scope: GameObject): void {
    this.target = game.states.states[`$$${this.area}$${this.room}`];

    if (!this.target) throw new Error(`${this.area}: no room ${this.room}`);

    this.actions.forEach((a) => a.validate(game, scope));
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    const hit = this.self
      ? game.player.CarriedObjects[this.target.key].has(scope.key)
      : this.target === game.player.state;

    game.debug(`test ${this.self ? scope.name : 'me'} at ${this.target.key}`);

    if (hit) Action.run(this.actions, scope, game);
  }
}
