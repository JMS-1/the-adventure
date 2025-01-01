import { Action } from '.';
import { GameObject } from '../gameObject';
import { State } from '../gameObject/state';
import { ThingOrPerson } from '../gameObject/thingOrPerson';
import { GameService } from '../services/game.service';
import { ParseContext } from './parseContext';

export class MoveAction extends Action {
  public static readonly Pattern = /^(#)?>(\$\$([^$]+)\$)?([^,)\s>]+)/;

  private _target!: State;

  private constructor(
    public readonly area: string | null,
    public readonly room: string,
    public readonly self: boolean
  ) {
    super();
  }

  static parse(match: RegExpMatchArray, context: ParseContext) {
    context.skip(match[0].length);

    return new MoveAction(match[3] ?? null, match[4], !!match[1]);
  }

  override validate(game: GameService, scope: GameObject): void {
    this._target =
      game.states.states[
        `$$${this.area || (scope instanceof State ? scope.area : '')}$${
          this.room
        }`
      ];

    if (!this._target) throw new Error(`${this.area}: no room ${this.room}`);

    if (this.self && !(scope instanceof ThingOrPerson))
      throw new Error(`${scope.name} not a thing or person`);
  }

  protected override onRun(scope: GameObject, game: GameService): void {
    const { player } = game;

    if (this.self) {
      game.debug(`move ${scope.key} to ${this._target.key}`);

      player.removeThingOrPersonFromCarriers(scope as ThingOrPerson);

      player.addThingOrPersonToCarrier(scope as ThingOrPerson, this._target);
    } else if (this._target !== player.state) {
      game.debug(`goto ${this._target.key}`);

      player.enterState(this._target);
    }
  }
}
