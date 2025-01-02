import { GameObject } from '.';
import { type GameService } from '../services/game.service';
import { Entity } from './entity';
import { EntityAssignments } from './entity-assignments';
import { systemMessages } from './messages';
import { stateOperations } from './operations';
import { State } from './state';
import { Time } from './time';
import { Timers } from './timers';
import { Weight } from './weight';

export class Player {
  dead = false;

  private _timers = new Timers();

  readonly carriedObjects = new EntityAssignments();

  readonly inventory = new Set<string>();

  readonly messages: Record<string, string> = {};

  constructor(
    public state: State,
    public weight: Weight,
    public time: Time,
    private readonly _game: GameService
  ) {}

  nextTick() {
    this.time.increment();

    this._timers.advance(this._game);
  }

  startTimers(entity: Entity) {
    this._timers.start(entity, this._game);
  }

  stopTimers(entity: Entity) {
    this._timers.stop(entity);
  }

  dropEntity(entity: Entity, silent: boolean) {
    this.carriedObjects.delete(entity);

    if (this.inventory.has(entity.name)) {
      this.weight.add(entity.weight);

      this.inventory.delete(entity.name);
    }

    if (!silent) this.print(entity);
  }

  addEntityToParent(entity: Entity, parent: GameObject, silent: boolean) {
    this.dropEntity(entity, silent);

    this.carriedObjects.add(entity, parent);

    if (!silent) this.print(entity);
  }

  pickEntity(entity: Entity) {
    if (this.inventory.has(entity.name)) return;

    if (!this.weight.subtract(entity.weight))
      this._game.error(systemMessages.Heavy);
    else {
      this.dropEntity(entity, false);

      this.inventory.add(entity.name);
    }
  }

  isVisible(gameObject: GameObject | undefined) {
    if (gameObject instanceof State) return gameObject === this.state;

    if (!gameObject) return false;

    return (
      this.inventory.has(gameObject.key) ||
      this.carriedObjects.has(this.state, gameObject)
    );
  }

  setMessage(gameObject: GameObject, message: string, silent: boolean) {
    this.messages[gameObject.key] = message;

    if (!silent) this.print(gameObject);
  }

  print(gameObject: GameObject | string | undefined) {
    if (typeof gameObject === 'string')
      gameObject = this._game.objects.entity[gameObject];

    if (this.isVisible(gameObject))
      this.printRandomMessage(
        gameObject!.getMessage(
          this._game.messages,
          this.messages[gameObject!.key]
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

    for (const entity of this.carriedObjects.children(state))
      this.print(entity);

    this.state.run(stateOperations.enter, this._game);
  }
}
