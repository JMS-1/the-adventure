import { Action } from '../actions';
import { GameService } from '../services/game.service';
import { Entity } from './entity';

/** Represents a single active timer. */
export class Timer {
  /** Next exeuction time - in game ticks, each command is a tick. */
  private _next;

  /**
   * Create a new timer.
   *
   * @param entity owner of the timer.
   * @param _at interval of the timer.
   * @param _once set if the timer should fire only once.
   * @param _key name of the timer as known be the owner.
   */
  constructor(
    public readonly entity: Entity,
    private readonly _at: number,
    private readonly _once: boolean,
    private readonly _key: string
  ) {
    /** Start right now. */
    this._next = this._at;
  }

  /**
   * Process the next game tick.
   *
   * @param game current active game.
   */
  nextTick(game: GameService) {
    /** Timer is stopped. */
    if (this._next <= 0) return;

    /** Count game ticks and continue if timer is not yet expired. */
    this._next--;

    if (this._next) return;

    /** Reset the counter if the timer is not a signle shot timer. */
    if (!this._once) this._next = this._at;

    /** Execute the actions corresponding to the timer. */
    game.debug(
      `${this.entity.name} ${this._once ? '' : 'interval '}timer at ${this._at}`
    );

    Action.run(this.entity.times[this._key], this.entity, game);
  }

  /**
   * Prepare to persist state.
   *
   * @returns JSON representation of this timer.
   */
  save() {
    return {
      at: this._at,
      entity: this.entity.name,
      key: this._key,
      once: this._once,
    };
  }

  /**
   * Reconstruct a timer from the persisted stated.
   *
   * @param saved result from a call to save.
   * @param game current active game which will be restored.
   *
   * @returns The timer instance representing the JSON representation.
   */
  static load(saved: unknown, game: GameService) {
    const json = saved as ReturnType<Timer['save']>;

    return new Timer(
      game.objects.findEntity(json.entity),
      json.at,
      json.once,
      json.key
    );
  }
}
