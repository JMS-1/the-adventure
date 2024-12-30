import { GameObject } from '.';
import { Action } from '../actions';
import { GameService } from '../services/game.service';
import { State } from './state';
import { ThingOrPerson } from './thingOrPerson';
import { Time } from './time';
import { Weight } from './weight';

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

    Action.run(this._actions, this.gameObject, game);
  }
}

export class Player {
  dead = false;

  private _timers: Timer[] = [];

  readonly StateObjects: Record<string, Set<string>> = {};

  constructor(
    public state: State,
    public weight: Weight,
    public time: Time,
    private readonly _game: GameService
  ) {}

  nextTick() {
    this.time.increment();

    this._timers.slice().forEach((t) => t.nextTick(this._game));
  }

  startTimers(gameObject: ThingOrPerson) {
    if (this._timers.some((t) => t.gameObject === gameObject))
      throw new Error(`${gameObject.name} timers already started`);

    this._timers.push(
      ...Object.keys(gameObject.times).map((time) => {
        const once = !time.startsWith('+');
        const at = parseInt(once ? time : time.substring(1));

        return new Timer(gameObject, at, once, gameObject.times[time]);
      })
    );
  }

  stopTimers(gameObject: ThingOrPerson) {
    this._timers = this._timers.filter((t) => t.gameObject !== gameObject);
  }
}
