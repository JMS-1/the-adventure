import { inject, Injectable, OnDestroy } from '@angular/core';
import { combineLatest, ReplaySubject, Subject, tap } from 'rxjs';
import { Action } from '../actions';
import { CommandService } from '../commands/command.service';
import { Entity } from '../game-object/entity';
import { systemMessages } from '../game-object/messages';
import { roomOperations } from '../game-object/operations';
import { Player } from '../game-object/player';
import { Room } from '../game-object/room';
import { systemShortcuts } from '../game-object/shortcuts';
import { Time } from '../game-object/time';
import { Weight } from '../game-object/weight';
import { DefaultsService } from './defaults.service';
import { InfoService } from './info.service';
import { MessagesService } from './messages.service';
import { ObjectsService } from './objects.service';
import { RoomsService } from './rooms.service';
import { SettingsService } from './settings.service';

/** All messages for the days of week. */
const days: systemMessages[] = [
  systemMessages.Day0,
  systemMessages.Day1,
  systemMessages.Day2,
  systemMessages.Day3,
  systemMessages.Day4,
  systemMessages.Day5,
  systemMessages.Day6,
];

/** Key of this application in the local storage. */
const storageKeyPrefix = 'W3ADV.States.';

/** Game management service. */
@Injectable()
export class GameService implements OnDestroy {
  readonly commands = inject(CommandService);
  readonly defaults = inject(DefaultsService);
  readonly info = inject(InfoService);
  readonly messages = inject(MessagesService);
  readonly objects = inject(ObjectsService);
  readonly rooms = inject(RoomsService);
  readonly settings = inject(SettingsService);

  /** Signaled as soon as all declarations are read - successfull or not. */
  private readonly _parseDone$ = new ReplaySubject<boolean>(1);

  readonly ready$ = this._parseDone$.asObservable();

  /** Observable reporting any type of output the game may produce. */
  private readonly _output$ = new Subject<
    ['out' | 'debug' | 'error' | 'verbatim' | 'input', string]
  >();

  readonly output$ = this._output$.asObservable();

  /** Incremented to suppress regular output - error messages et al are still shown. */
  private _suppressOutput = 0;

  /** Set after parsing is complete and may contain an error. */
  lastError = '';

  /** The current state of the game. */
  player = new Player(
    new Room('n/a', 'n/a'),
    new Weight('(0,0,0)'),
    new Time('(d0/0,h0/0,m0/1)'),
    null!
  );

  /** Create a new game - will hold references to all managers. */
  constructor() {
    /** Wait for all parsings. */
    const subscription = combineLatest([
      this.commands.parseDone$,
      this.defaults.parseDone$,
      this.info.parseDone$,
      this.messages.parseDone$,
      this.objects.parseDone$,
      this.rooms.parseDone$,
    ])
      .pipe(
        tap((errors) => {
          /** Combine error message into one. */
          const error = errors.filter((e) => e).join('; ');

          if (error) throw new Error(`parsing error: ${error}`);
        }),
        tap(() => this.setup())
      )
      .subscribe({
        error: (e) => {
          /** Done with parsing error. */
          this.lastError = e.message;

          this._parseDone$.next(true);
        },
        next: () => {
          /** Game is now ready. */
          subscription.unsubscribe();

          this._parseDone$.next(true);
        },
      });
  }

  /** Parse everything. */
  parse() {
    this.commands.parse();
    this.defaults.parse();
    this.info.parse();
    this.messages.parse();
    this.objects.parse();
    this.rooms.parse();
  }

  ngOnDestroy() {
    this._parseDone$.complete();
    this._output$.complete();
  }

  /** Startup the game. */
  private setup() {
    /** Fetch the initial room. */
    const room = this.rooms.rooms[this.defaults.room];

    if (!room)
      throw new Error(`initial room '${this.defaults.room}' not found`);

    /** Initialize the state of the game. */
    this.player = new Player(
      room,
      new Weight(this.defaults.weight),
      new Time(this.defaults.time),
      this
    );

    /** Just every game object. */
    const objects = [
      ...Object.values(this.objects.entities),
      ...Object.values(this.rooms.rooms),
    ];

    /** Merge in defaults. */
    for (const gameObject of objects) gameObject.loadDefaults(this);

    /** Validate everything. */
    for (const gameObject of objects) gameObject.prepare(this);

    /** Show the game introduction. */
    this.verbatim(this.info.intro);

    /** Start the game itself. */
    this.player.room.run(roomOperations.stay, this);
  }

  /**
   * Give some text output keeping formattings.
   *
   * @param message message to report.
   */
  private verbatim(message: string) {
    this._output$.next(['verbatim', message]);
  }

  /** Show help informaation. */
  help() {
    this.verbatim('\n\n' + this.info.help);
  }

  /**
   * Output debug text.
   *
   * @param message trace information.
   */
  debug(message: string) {
    this._output$.next(['debug', message]);
  }

  /**
   * Retrieve a system message.
   *
   * @param message system message key.
   * @returns system message.
   */
  private getMessage(message: systemMessages) {
    const messages = this.messages.messageMap[`${message}`];

    /** May want to randomize. */
    return messages?.[Math.floor(Math.random() * messages?.length)] || message;
  }

  /**
   * Output some regular in-game message.
   *
   * @param message message to display.
   * @param force display even if output is suppressed.
   */
  output(message: string | string[], force = false) {
    /* See if output is allowed. */
    if (this._suppressOutput > 0 && !force) return;

    /** May want to choose of multiple alternatives. */
    if (Array.isArray(message))
      message = message[Math.floor(Math.random() * message.length)];

    /** Report the new message. */
    this._output$.next(['out', '\n' + message]);
  }

  /**
   * Report an error.
   *
   * @param key message key for the error.
   */
  error(key: string | systemMessages) {
    /** Make enumeration a key. */
    const messages = this.messages.messageMap[`${key}`];

    if (!messages?.length) return;

    /** May choose from multiple alternatives. */
    const choice = messages[Math.floor(Math.random() * (messages.length ?? 0))];

    this._output$.next(['error', choice + '\n']);
  }

  /**
   * Take a step in the game.
   *
   * @param input Input from the user.
   */
  run(input: string) {
    /** Just skip empty lines - especially no time is advanced. */
    input = input.trim();

    if (!input) return;

    /** Show what we process. */
    this._output$.next(['input', '\n>> ' + input + '\n']);

    /** Create a mapping of the input names of all visible objects to the entity names. */
    const thingsAndPersons = this.player.entities.reduce((map, name) => {
      for (const word of this.objects.entities[name].words)
        map[word.toLowerCase()] = name;

      return map;
    }, {} as Record<string, string>);

    /** The current state. */
    const { room, dead } = this.player;

    /** Reset all outputs. */
    this.player.resetPrint();

    try {
      try {
        /** Check any command available from the input. */
        for (const [command, entity] of this.commands.analyseCommand(
          input,
          thingsAndPersons
        )) {
          /** Command may be a well known short-cut. */
          const shortcut = this.defaults.keyMap[command];

          if (entity) {
            /** Use has addressed an entity. */
            const scope = this.objects.findEntity(entity);

            switch (shortcut) {
              case systemShortcuts.Drop:
                return this.dropEntity(scope);
              case systemShortcuts.Pick:
                return this.pickEntity(scope);
              default:
                /** Must check for declared commands - will include defaults as well */
                this.debug(`${command} on ${scope.key}`);

                return scope.runCommand(command, this);
            }
          }

          /** See if any entity understands the command. */
          for (const key of this.player.entities) {
            const entity = this.objects.entities[key];
            const actions = entity.commands[command];

            if (actions?.length) {
              this.debug(`command ${command} on ${entity.key}`);

              return Action.run(actions, entity, this);
            }
          }

          /** Entity free command. */
          switch (shortcut) {
            case systemShortcuts.Clock:
              return this.dumpTime();
            case systemShortcuts.Quit:
              this.settings.game = undefined;

              return;
            case systemShortcuts.View:
              this.dumpCurrentRoom();

              return this.dumpInventory();
            case systemShortcuts.Look:
              return this.dumpCurrentRoom();
            case systemShortcuts.Say: {
              this.debug(`say something`);

              /** The default say command must not include entity related actions. */
              return Action.run(this.defaults.commands[command], null!, this);
            }
            default: {
              if (shortcut) {
                /** All other short-cuts are exists. */
                this.debug(`use exit ${shortcut} on ${room.key}`);

                /** Respect defaults as well - including the * wildcard exit normally connected to some error message. */
                const exits =
                  room.exits[shortcut] ||
                  this.defaults.exits[shortcut] ||
                  room.exits['*'] ||
                  this.defaults.exits['*'] ||
                  [];

                return Action.run(exits, room, this);
              }
            }
          }
        }

        /** Not matching any command. */
        this.debug('unknown command');

        this.error(systemMessages.NoComm);
      } finally {
        /** We are still in the same room. */
        if (!this.player.dead && this.player.room === room)
          room.run(roomOperations.stay, this);

        /** Advance time now if we are still alive aka playing. */
        if (!this.player.dead) this.player.nextTick();

        /** Display current room with things or report final message if player is now dead. */
        if (!this.player.dead) this.dumpCurrentRoom(true);
        else if (!dead) this.verbatim(this.info.extro);
      }
    } catch (e) {
      /** Actually a very bad thing to happen. */
      this.debug(`${e}`);
    }
  }

  /**
   * Show the current room and the things lying around.
   *
   * @param short set to display the short description.
   */
  dumpCurrentRoom(short = false) {
    const { player } = this;
    const { room } = player;

    this.debug(`show room ${room.key}`);

    const exits = short ? [] : room.exits[systemShortcuts.Look.toString()];

    if (exits?.length) Action.run(exits, room, this);
    else player.print(room);

    for (const entity of player.carriedObjects.children(room))
      player.print(entity);
  }

  /** List what we are carrying around. */
  dumpInventory() {
    const { player } = this;

    this.debug(
      `view inventory ${JSON.stringify(Array.from(this.player.inventory))}`
    );

    for (const entity of player.inventory) player.print(entity);
  }

  /** Show the current time. */
  private dumpTime() {
    this.debug(`show clock ${this.player.time}`);

    const { hours, minutes } = this.player.time;

    this.output(
      this.getMessage(systemMessages.Clock1) +
        ' ' +
        this.getMessage(days[this.player.time.dayOfWeek]) +
        ' ' +
        `${`${hours}`.padStart(2, '0')}` +
        ':' +
        `${`${minutes}`.padStart(2, '0')}` +
        ' ' +
        this.getMessage(systemMessages.Clock2)
    );
  }

  /**
   * Add an entity to the players inventory.
   *
   * @param entity The entity to pick up.
   */
  pickEntity(entity: Entity) {
    /** Can only have each entity once in the inventory. */
    if (this.player.inventory.has(entity.key)) return;

    this.debug(`pick ${entity.key}`);

    if (this.player.pickEntity(entity))
      entity.runSystemCommand(systemShortcuts.Pick, this);
  }

  /**
   * Drop something from the inventory or the player.
   *
   * @param entity entity to drop.
   */
  dropEntity(entity: Entity) {
    /** Can only drop if the player has it. */
    if (!this.player.inventory.has(entity.key)) return;

    /** Just drop in the current state. */
    this.debug(`drop ${entity.key}`);

    this.player.attachEntity(entity, this.player.room, true);

    entity.runSystemCommand(systemShortcuts.Drop, this);
  }

  /** Get the local storage key where games are saved. */
  private get storageKey() {
    return `${storageKeyPrefix}${this.settings.game}.state`;
  }

  /** Retrieve the current saved states. */
  get currentSavedStates(): { when: number; state: unknown }[] {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    } catch {
      return [];
    }
  }

  /** Write the current game state to the local storage. */
  save() {
    /** All saved stated. */
    const saved = this.currentSavedStates;

    /** Keep at most 10. */
    saved.splice(0, Math.max(0, saved.length - 9));

    /** Add the new one. */
    saved.push({ when: Date.now(), state: this.player.save() });

    /** Remember. */
    localStorage.setItem(this.storageKey, JSON.stringify(saved));
  }

  /**
   * @param state Load the game state from the local storage.
   *
   * @param state state to load.
   * @returns set if a new state has been loaded.
   */
  load(state: unknown) {
    try {
      /** Check for saved games. */
      if (!state) return false;

      /** Reload the state but do not start the game. */
      this.player = Player.load(state, this);

      return true;
    } catch (e) {
      /** Something went wrong. */
      this.lastError = (e as Error).message;

      return false;
    }
  }

  /**
   * Execute something.
   *
   * @param action what to execute.
   * @param silent set to supress output during processing - may be nested.
   */
  execute(action: () => boolean, silent: boolean) {
    /** Nothign tu suppress. */
    if (!silent) return action();

    /** Add a level of suppressing output. */
    this._suppressOutput++;

    try {
      /** Execute as requested. */
      return action();
    } finally {
      /** Restore to previous level of suppression. */
      this._suppressOutput--;
    }
  }

  /**
   * Caluclate the full weight of a single entity or a list of entities..
   *
   * @param entities where to start.
   * @param ignore all enties processed so far - avoid cyles.
   * @returns total weight of the entities including nested entitites in any depth.
   */
  calcWeight(entities: Set<string>, ignore = new Set<string>()) {
    /** Process all entities. */
    const sum = new Weight('(0,0,0)');

    for (const name of entities) {
      /** Ups already did it - should never happen but better be save than sorry. */
      if (ignore.has(name)) continue;

      /** See if entiy exists and is movable. */
      const entity = this.objects.entities[name];

      if (!entity?.entityWeight) continue;

      /** Sum up.  */
      sum.add(entity.entityWeight);

      /** Cycle check - count this entity never again. */
      ignore.add(name);

      /** Check for entities carried by this one. */
      sum.add(
        this.calcWeight(this.player.carriedObjects.children(entity), ignore)
      );
    }

    return sum;
  }
}
