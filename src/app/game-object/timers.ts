import type { GameService } from '../services/game.service';
import { Entity } from './entity';
import { Timer } from './timer';

export class Timers {
  private _timers: Timer[] = [];

  advance(game: GameService) {
    [...this._timers].forEach((t) => t.nextTick(game));
  }

  start(entity: Entity, game: GameService) {
    if (this._timers.some((t) => t.entity === entity))
      throw new Error(`${entity.name} timers already started`);

    this._timers.push(
      ...Object.keys(entity.times).map((time) => {
        const once = !time.startsWith('+');
        const at = parseInt(once ? time : time.substring(1));

        game.debug(`time ${once ? 'at' : 'each'} ${at}`);

        return new Timer(entity, at, once, time);
      })
    );
  }

  stop(entity: Entity) {
    this._timers = this._timers.filter((t) => t.entity !== entity);
  }
}
