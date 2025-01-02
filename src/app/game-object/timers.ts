import type { GameService } from '../services/game.service';
import { Entity } from './entity';
import { Timer } from './timer';

/** Management of active timers. */
export class Timers {
  /** All currently known active timers. */
  private _timers: Timer[] = [];

  /**
   * Advance one game tick.
   *
   * @param game the active game.
   */
  advance(game: GameService) {
    [...this._timers].forEach((t) => t.nextTick(game));
  }

  /**
   * Start timers of an entity.
   *
   * @param entity The entity which timers should be started.
   * @param game the current active game.
   */
  start(entity: Entity, game: GameService) {
    /** May only start timer once for each entity. */
    if (this._timers.some((t) => t.entity === entity))
      throw new Error(`${entity.name}: timers already started`);

    /** Check all timers of the entity. */
    this._timers.push(
      ...Object.keys(entity.times).map((time) => {
        /** Split key into inverval value and one shot flag. */
        const once = !time.startsWith('+');
        const at = parseInt(once ? time : time.substring(1));

        /** Convert to timer. */
        game.debug(`time ${once ? 'at' : 'each'} ${at}`);

        return new Timer(entity, at, once, time);
      })
    );
  }

  /**
   * Remove all timers of a given entity.
   *
   * @param entity the entity to stop.
   */
  stop(entity: Entity) {
    this._timers = this._timers.filter((t) => t.entity !== entity);
  }

  /**
   * Prepare to persist state.
   *
   * @returns JSON representation of all active timers.
   */
  save() {
    return { timers: this._timers.map((t) => t.save()) };
  }

  /**
   * Reconstruct all active timers from the persisted stated.
   *
   * @param saved result from a call to save.
   * @param game current active game which will be restored.
   *
   * @returns The timer management the JSON representation.
   */
  load(saved: unknown, game: GameService) {
    const json = saved as ReturnType<Timers['save']>;

    this._timers = json.timers.map((t) => Timer.load(t, game));
  }
}
