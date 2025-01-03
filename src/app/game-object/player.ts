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

  dropEntity(entity: Entity) {
    this.carriedObjects.delete(entity);

    if (this.inventory.has(entity.name)) {
      this.weight.add(entity.weight);

      this.inventory.delete(entity.name);
    }

    this.print(entity);
  }

  addEntityToParent(entity: Entity, parent: GameObject) {
    this.dropEntity(entity);

    this.carriedObjects.add(entity, parent);

    this.print(entity);
  }

  pickEntity(entity: Entity) {
    if (this.inventory.has(entity.name)) return;

    if (!this.weight.subtract(entity.weight))
      this._game.error(systemMessages.Heavy);
    else {
      this.dropEntity(entity);

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

  setMessage(gameObject: GameObject, message: string) {
    this.messages[gameObject.key] = message;

    this.print(gameObject);
  }

  print(gameObject: GameObject | string | undefined) {
    if (typeof gameObject === 'string')
      gameObject = this._game.objects.entities[gameObject];

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

  /**
   * Leve the current room and move to another.
   *
   * @param state room to move the player to
   */
  enterState(state: State) {
    /** We are already there. */
    if (state === this.state) return;

    /** Exit the current state. */
    this.state.run(stateOperations.exit, this._game);

    /** Show the new state. */
    this.state = state;

    this.dumpState();

    /** Enter the new state. */
    this.state.run(stateOperations.enter, this._game);
  }

  /** Report the current state and everything laying around. */
  dumpState() {
    this.print(this.state);

    for (const entity of this.carriedObjects.children(this.state))
      this.print(entity);
  }

  save() {
    return {
      assignments: this.carriedObjects.save(),
      dead: this.dead,
      inventory: Array.from(this.inventory),
      messages: this.messages,
      state: this.state.key,
      time: this.time.save(),
      timers: this._timers.save(),
      weight: this.weight.save(),
    };
  }

  static load(serialized: unknown, game: GameService) {
    const json = serialized as ReturnType<Player['save']>;

    const player = new Player(
      game.states.states[json.state],
      Weight.load(json.weight),
      Time.load(json.time),
      game
    );

    player.dead = json.dead;

    player.carriedObjects.load(json.assignments, game);

    player._timers.load(json.timers, game);

    for (const entity of json.inventory) player.inventory.add(entity);

    for (const key of Object.keys(json.messages))
      player.messages[key] = json.messages[key];

    return player;
  }

  get entities() {
    return [...this.inventory, ...this.carriedObjects.children(this.state)];
  }
}
