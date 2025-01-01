import { GameObject } from '.';
import { type GameService } from '../services/game.service';
import { State } from './state';
import { stateOperations } from './stateOperations';
import { systemMessages } from './systemMessages';
import { ThingOrPerson } from './thingOrPerson';
import { Time } from './time';
import { Timer } from './timer';
import { Weight } from './weight';

export class Player {
  dead = false;

  private _timers: Timer[] = [];

  readonly CarriedObjects: Record<string, Set<string>> = {};

  readonly Inventory = new Set<string>();

  readonly Messages: Record<string, [string, string?]> = {};

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

        this._game.debug(`time ${once ? 'at' : 'each'} ${at}`);

        return new Timer(gameObject, at, once, gameObject.times[time]);
      })
    );
  }

  stopTimers(thingOrPerson: ThingOrPerson) {
    this._timers = this._timers.filter((t) => t.gameObject !== thingOrPerson);
  }

  removeThingOrPersonFromCarriers(thingOrPerson: ThingOrPerson) {
    Object.values(this.CarriedObjects).forEach((s) =>
      s.delete(thingOrPerson.name)
    );
  }

  addThingOrPersonToCarrier(
    thingOrPerson: ThingOrPerson,
    gameObject: GameObject
  ) {
    this.removeThingOrPersonFromInventory(thingOrPerson);

    this.CarriedObjects[gameObject.key].add(thingOrPerson.name);
  }

  addThingOrPersonToInventory(thingOrPerson: ThingOrPerson) {
    if (this.Inventory.has(thingOrPerson.name)) return;

    if (this.weight.subtract(thingOrPerson.weight)) {
      this.Inventory.add(thingOrPerson.name);

      this.removeThingOrPersonFromCarriers(thingOrPerson);
    } else this._game.error(systemMessages.Heavy);
  }

  removeThingOrPersonFromInventory(thingOrPerson: ThingOrPerson) {
    if (!this.Inventory.has(thingOrPerson.name)) return;

    this.weight.add(thingOrPerson.weight);

    this.Inventory.delete(thingOrPerson.name);
  }

  setMessage(
    gameObject: GameObject,
    message: string,
    silent: boolean,
    game: GameService
  ) {
    const messages = gameObject.getMessage(game.messages, message);

    const choice =
      messages?.[Math.floor(Math.random() * (messages?.length ?? 0))];

    this.Messages[gameObject.key] = [message, choice];

    if (choice && !silent) game.output(choice);
  }

  print(scope: string | GameObject) {
    if (scope instanceof GameObject) scope = scope.key;

    const info = this.Messages[scope];

    if (info?.[1]) this._game.output(info[1]);
  }

  enterState(state: State) {
    this.state.run(stateOperations.exit, this._game);

    this.state = state;

    this.print(state);

    for (const thingOrPerson of this.CarriedObjects[state.key])
      this.print(thingOrPerson);

    this.state.run(stateOperations.enter, this._game);
  }
}
