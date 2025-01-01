import { GameObject } from '.';
import { Action } from '../actions';
import { GameService } from '../services/game.service';

export class Timer {
  private _next;

  constructor(
    public readonly gameObject: GameObject,
    private readonly _at: number,
    private readonly _once: boolean,
    private readonly _actions: Action[]
  ) {
    this._next = this._at;
  }

  nextTick(game: GameService) {
    if (this._next <= 0) return;

    this._next--;

    if (this._next) return;

    if (!this._once) this._next = this._at;

    game.debug(
      `${this.gameObject.name} ${this._once ? '' : 'interval '}timer at ${
        this._at
      }`
    );

    Action.run(this._actions, this.gameObject, game);
  }
}
