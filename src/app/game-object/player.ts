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

  dropThingOrPerson(thingOrPerson: ThingOrPerson, silent: boolean) {
    Object.values(this.CarriedObjects).forEach((s) =>
      s.delete(thingOrPerson.name)
    );

    if (this.Inventory.has(thingOrPerson.name)) {
      this.weight.add(thingOrPerson.weight);

      this.Inventory.delete(thingOrPerson.name);
    }

    if (!silent) this.print(thingOrPerson);
  }

  addThingOrPersonToCarrier(
    thingOrPerson: ThingOrPerson,
    gameObject: GameObject,
    silent: boolean
  ) {
    this.dropThingOrPerson(thingOrPerson, silent);

    this.CarriedObjects[gameObject.key].add(thingOrPerson.name);

    if (!silent) this.print(thingOrPerson);
  }

  pickThingOrPerson(thingOrPerson: ThingOrPerson) {
    if (this.Inventory.has(thingOrPerson.name)) return;

    if (!this.weight.subtract(thingOrPerson.weight))
      this._game.error(systemMessages.Heavy);
    else {
      this.dropThingOrPerson(thingOrPerson, false);

      this.Inventory.add(thingOrPerson.name);
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
      gameObject = this._game.objects.thingOrPerson[gameObject];

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

    for (const thingOrPerson of this.CarriedObjects[state.key])
      this.print(thingOrPerson);

    this.state.run(stateOperations.enter, this._game);
  }
}
