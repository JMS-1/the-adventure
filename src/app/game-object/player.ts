import { GameObject } from '.';
import { type GameService } from '../services/game.service';
import { Entity } from './entity';
import { EntityAssignments } from './entity-assignments';
import { systemMessages } from './messages';
import { roomOperations } from './operations';
import { Room } from './room';
import { Time } from './time';
import { Timers } from './timers';
import { Weight } from './weight';

/** A player instance represents the current game state. */
export class Player {
  /** Set as soon as the player died - game is over. */
  dead = false;

  /** All currently active timers - from multiple emtities. */
  private _timers = new Timers();

  /** Which entity or room holds which entities. */
  readonly carriedObjects = new EntityAssignments();

  /** Name of the entities hold by the player itself. */
  readonly inventory = new Set<string>();

  /** Current message for each game object - will often be different from the declared values. */
  readonly messages: Record<string, string> = {};

  /**
   * Create a new player.
   *
   * @param room room to start with.
   * @param weight strength of the player.
   * @param time game time.
   * @param _game active game.
   */
  constructor(
    public room: Room,
    public weight: Weight,
    public time: Time,
    private readonly _game: GameService
  ) {}

  /** Advance the time. */
  nextTick() {
    /** Just to display the time to the user. */
    this.time.increment();

    /** Eventually execute elapsed timers. */
    this._timers.advance(this._game);
  }

  /**
   * Start all timers of an entity.
   *
   * @param entity entity to use.
   */
  startTimers(entity: Entity) {
    this._timers.start(entity, this._game);
  }

  /**
   * Stop all timers of an entity.
   *
   * @param entity entity to use.
   */
  stopTimers(entity: Entity) {
    this._timers.stop(entity);
  }

  /**
   * Make sure an entity is not attach to any game object or
   * carried by the player.
   *
   * @param entity Entity to remove.
   */
  detachEntity(entity: Entity) {
    /** Remove from all game objects. */
    this.carriedObjects.delete(entity);

    /** Remove from player. */
    if (this.inventory.has(entity.name)) {
      this.inventory.delete(entity.name);

      /** Must adjust total weight of the inventory. */
      this.weight.add(entity.weight);
    }
  }

  /**
   * Add an entity to a room or another entity.
   *
   * @param entity entity to add.
   * @param parent new parent game object for the entity.
   */
  attachEntity(entity: Entity, parent: GameObject) {
    /* Silent remove first - just in case. */
    this.detachEntity(entity);

    /** Add to new parent. */
    this.carriedObjects.add(entity, parent);

    /** Show entity state if entity is now visible. */
    this.print(entity);
  }

  /**
   * Add an entity to the inventory.
   *
   * @param entity entity to add.
   */
  pickEntity(entity: Entity) {
    /** Can have an entity at most once in the inventory. */
    if (this.inventory.has(entity.name)) return;

    /** Check if the maximum strength of the player is not exceeded. */
    if (!this.weight.subtract(entity.weight))
      this._game.error(systemMessages.Heavy);
    else {
      /** Remove the entity from all parent. */
      this.detachEntity(entity);

      /** Add the entity to inventory. */
      this.inventory.add(entity.name);
    }
  }

  /**
   * Check if an game object is visible. Typically used to
   * decide if the current message of the object should be
   * displayed.
   *
   * @param gameObject any game object.
   * @returns set if the game object is visible.
   */
  private isVisible(gameObject: GameObject | undefined) {
    /** Of all rooms only the room in which the player is will be visible. */
    if (gameObject instanceof Room) return gameObject === this.room;

    /** Just in case. */
    if (!(gameObject instanceof Entity)) return false;

    /** All entities in the players inventory or lying around in the current rooms are visible. */
    return (
      this.inventory.has(gameObject.key) ||
      this.carriedObjects.has(this.room, gameObject)
    );
  }

  /**
   * Set the active message of an entity or an room.
   *
   * @param gameObject game object to change.
   * @param message new message to use.
   */
  setMessage(gameObject: GameObject, message: string) {
    /** Update message and display. */
    this.messages[gameObject.key] = message;

    this.print(gameObject);
  }

  /**
   * Output the current state of an entity or room.
   *
   * @param gameObject game object to show.
   */
  print(gameObject: GameObject | string | undefined) {
    /** If the parameter is only the key of an entity make sure it exists - rooms can only be displayed using the instance. */
    if (typeof gameObject === 'string')
      gameObject = this._game.objects.entities[gameObject];

    /** Display the message if the game object is visible. */
    if (this.isVisible(gameObject))
      this.printRandomMessage(
        gameObject!.getMessage(
          this._game.messages,
          this.messages[gameObject!.key]
        )
      );
  }

  /**
   * Choose one message out of a set of messages to display.
   *
   * @param messages list of alternate messages to display.
   */
  printRandomMessage(messages: string[] | undefined) {
    /** Message parameter may be empty - in case message is *. */
    if (!messages?.length) return;

    /** Choose one message from the variants - works for a single alternative as well. */
    const choice = messages[Math.floor(Math.random() * messages.length)];

    if (choice) this._game.output(choice);
  }

  /**
   * Leve the current room and move to another.
   *
   * @param room room to move the player to
   */
  enterRoom(room: Room) {
    /** We are already there. */
    if (room === this.room) return;

    /** Exit the current room. */
    this.room.run(roomOperations.exit, this._game);

    /** Show the new room. */
    this.room = room;

    this.dumpRoom();

    /** Enter the new room. */
    this.room.run(roomOperations.enter, this._game);
  }

  /** Report the current room and everything laying around. */
  dumpRoom() {
    this.print(this.room);

    for (const entity of this.carriedObjects.children(this.room))
      this.print(entity);
  }

  /** Create a JSON represenation of the current game state. */
  save() {
    return {
      assignments: this.carriedObjects.save(),
      dead: this.dead,
      inventory: Array.from(this.inventory),
      messages: this.messages,
      room: this.room.key,
      time: this.time.save(),
      timers: this._timers.save(),
      weight: this.weight.save(),
    };
  }

  /**
   * Reconstruct a game state from the JSON representation.
   *
   * @param serialized JSON representation as a result from a call to save.
   * @param game active game.
   * @returns new player instance representing the previously saved game state.
   */
  static load(serialized: unknown, game: GameService) {
    const json = serialized as ReturnType<Player['save']>;

    const player = new Player(
      game.rooms.rooms[json.room],
      Weight.load(json.weight),
      Time.load(json.time),
      game
    );

    /** Copy all the stuff not available in the constructor. */
    player.dead = json.dead;

    player.carriedObjects.load(json.assignments, game);

    player._timers.load(json.timers, game);

    for (const entity of json.inventory) player.inventory.add(entity);

    for (const key of Object.keys(json.messages))
      player.messages[key] = json.messages[key];

    return player;
  }

  /** Report all visible entities, starting with the entities lying in the current room and followed by the inventory. */
  get entities() {
    return [...this.carriedObjects.children(this.room), ...this.inventory];
  }
}
