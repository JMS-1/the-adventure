import { GameObject } from '.';
import { type GameService } from '../services/game.service';
import { Entitiy } from './entity';
import { State } from './state';
import { stateOperations } from './stateOperations';
import { systemMessages } from './systemMessages';
import { Time } from './time';
import { Timer } from './timer';
import { Weight } from './weight';

export class Player {
  dead = false;

  private _timers: Timer[] = [];

  readonly CarriedObjects: Record<string, Set<string>> = {};

  readonly Inventory = new Set<string>();

  readonly Messages: Record<string, string> = {};

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

  startTimers(gameObject: Entitiy) {
    if (this._timers.some((t) => t.gameObject === gameObject))
      throw new Error(`${gameObject.name} timers already started`);

    this._timers.push(
      ...Object.keys(gameObject.times).map((time) => {
        const once = !time.startsWith('+');
        const at = parseInt(once ? time : time.substring(1));

        this._game.debug(`time ${once ? 'at' : 'each'} ${at}`);

        return new Timer(gameObject, at, once, gameObject.times[time]);
      })
    );
  }

  stopTimers(entity: Entitiy) {
    this._timers = this._timers.filter((t) => t.gameObject !== entity);
  }

  dropEntity(entity: Entitiy, silent: boolean) {
    Object.values(this.CarriedObjects).forEach((s) => s.delete(entity.name));

    if (this.Inventory.has(entity.name)) {
      this.weight.add(entity.weight);

      this.Inventory.delete(entity.name);
    }

    if (!silent) this.print(entity);
  }

  addEntityToParent(entity: Entitiy, gameObject: GameObject, silent: boolean) {
    this.dropEntity(entity, silent);

    this.CarriedObjects[gameObject.key].add(entity.name);

    if (!silent) this.print(entity);
  }

  pickEntity(entity: Entitiy) {
    if (this.Inventory.has(entity.name)) return;

    if (!this.weight.subtract(entity.weight))
      this._game.error(systemMessages.Heavy);
    else {
      this.dropEntity(entity, false);

      this.Inventory.add(entity.name);
    }
  }

  isVisible(gameObject: GameObject | undefined) {
    if (!gameObject) return false;

    return (
      gameObject === this.state ||
      this.Inventory.has(gameObject.key) ||
      this.CarriedObjects[this.state.key].has(gameObject.key)
    );
  }

  setMessage(gameObject: GameObject, message: string, silent: boolean) {
    this.Messages[gameObject.key] = message;

    if (!silent) this.print(gameObject);
  }

  print(gameObject: GameObject | string | undefined) {
    if (typeof gameObject === 'string')
      gameObject = this._game.objects.entity[gameObject];

    if (this.isVisible(gameObject))
      this.printRandomMessage(
        gameObject!.getMessage(
          this._game.messages,
          this.Messages[gameObject!.key]
        )
      );
  }

  printRandomMessage(messages: string[] | undefined) {
    if (!messages?.length) return;

    const choice = messages[Math.floor(Math.random() * messages.length)];

    if (choice) this._game.output(choice);
  }

  enterState(state: State) {
    this.state.run(stateOperations.exit, this._game);

    this.state = state;

    this.print(state);

    for (const entity of this.CarriedObjects[state.key]) this.print(entity);

    this.state.run(stateOperations.enter, this._game);
  }
}
