import { Injectable, OnDestroy } from '@angular/core';
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

const days: systemMessages[] = [
  systemMessages.Day0,
  systemMessages.Day1,
  systemMessages.Day2,
  systemMessages.Day3,
  systemMessages.Day4,
  systemMessages.Day5,
  systemMessages.Day6,
];

const storageKeyPrefix = 'W3ADV.';

@Injectable()
export class GameService implements OnDestroy {
  private readonly _parseDone$ = new ReplaySubject<boolean>(1);

  readonly ready$ = this._parseDone$.asObservable();

  private readonly _output$ = new Subject<
    ['out' | 'debug' | 'error' | 'verbatim', string]
  >();

  readonly output$ = this._output$.asObservable();

  private _suppressOutput = 0;

  lastError = '';

  player = new Player(
    new Room('n/a', 'n/a'),
    new Weight('(0,0,0)'),
    new Time('(d0/0,h0/0,m0/1)'),
    null!
  );

  constructor(
    public readonly commands: CommandService,
    public readonly defaults: DefaultsService,
    public readonly info: InfoService,
    public readonly messages: MessagesService,
    public readonly objects: ObjectsService,
    public readonly rooms: RoomsService,
    public readonly settings: SettingsService
  ) {
    const subscription = combineLatest([
      commands.parseDone$,
      defaults.parseDone$,
      info.parseDone$,
      messages.parseDone$,
      objects.parseDone$,
      rooms.parseDone$,
    ])
      .pipe(
        tap((errors) => {
          const error = errors.filter((e) => e).join('; ');

          if (error) throw new Error(`parsing error: ${error}`);
        }),
        tap(this.setup)
      )
      .subscribe({
        error: (e) => {
          this.lastError = e.message;

          this._parseDone$.next(true);
        },
        next: () => {
          subscription.unsubscribe();

          this._parseDone$.next(true);
        },
      });
  }

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

  private readonly setup = () => {
    const room = this.rooms.rooms[this.defaults.room];

    if (!room)
      throw new Error(`initial room '${this.defaults.room}' not found`);

    this.player = new Player(
      room,
      new Weight(this.defaults.weight),
      new Time(this.defaults.time),
      this
    );

    const objects = [
      ...Object.values(this.objects.entities),
      ...Object.values(this.rooms.rooms),
    ];

    for (const gameObject of objects) gameObject.loadDefaults(this);

    for (const gameObject of objects) gameObject.prepare(this);

    this.verbatim(this.info.intro);

    this.execute(() => this.player.room.run(roomOperations.stay, this), true);
  };

  private verbatim(message: string) {
    this._output$.next(['verbatim', message]);
  }

  help() {
    this.verbatim(this.info.help);
  }

  debug(message: string) {
    this._output$.next(['debug', message]);
  }

  private getMessage(message: systemMessages) {
    const messages = this.messages.messageMap[`${message}`];

    return messages?.[Math.floor(Math.random() * messages?.length)] || message;
  }

  output(message: string | string[], force = true) {
    if (this._suppressOutput > 0 && !force) return;

    if (Array.isArray(message))
      message = message[Math.floor(Math.random() * message.length)];
    else message = `${message}`;

    this._output$.next(['out', '\n' + message]);
  }

  error(key: string | systemMessages) {
    const messages = this.messages.messageMap[`${key}`];

    if (!messages?.length) return;

    const choice =
      messages?.[Math.floor(Math.random() * (messages?.length ?? 0))];

    this._output$.next(['error', choice + '\n']);
  }

  run(cmd: string) {
    cmd = cmd.trim();

    if (!cmd) return;

    const thingsAndPersons = this.player.entities.reduce((map, name) => {
      for (const word of this.objects.entities[name].words)
        map[word.toLowerCase()] = name;

      return map;
    }, {} as Record<string, string>);

    const room = this.player.room;
    const dead = this.player.dead;

    try {
      try {
        for (const [command, entity] of this.commands.analyseCommand(
          cmd,
          thingsAndPersons
        )) {
          const shortcut = this.defaults.keyMap[command];

          if (entity) {
            const scope = this.objects.findEntity(entity);

            switch (shortcut) {
              case systemShortcuts.Drop:
                return this.dropEntity(scope);
              case systemShortcuts.Pick:
                return this.pickEntity(scope);
              default:
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

              return Action.run(this.defaults.commands[command], null!, this);
            }
            default: {
              if (shortcut) {
                this.debug(`use exit ${shortcut} on ${room.key}`);

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

        this.debug('unknown command');

        this.error(systemMessages.NoComm);
      } finally {
        if (!this.player.dead && this.player.room === room)
          room.run(roomOperations.stay, this);

        if (!this.player.dead) this.player.nextTick();
        else if (!dead) this.verbatim(this.info.extro);
      }
    } catch (e) {
      this.debug(`${e}`);
    }
  }

  dumpCurrentRoom(debug = true) {
    const { player } = this;
    const { room } = player;

    if (debug) this.debug(`show room ${room.key}`);

    const exits = room.exits[systemShortcuts.Look.toString()];

    if (exits?.length) Action.run(exits, room, this);
    else player.print(room);

    for (const entity of player.carriedObjects.children(room))
      player.print(entity);
  }

  dumpInventory(debug = true) {
    const { player } = this;

    if (debug)
      this.debug(
        `view inventory ${JSON.stringify(Array.from(this.player.inventory))}`
      );

    for (const entity of player.inventory) player.print(entity);
  }

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

    this.player.pickEntity(entity);

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

    this.player.attachEntity(entity, this.player.room);

    entity.runSystemCommand(systemShortcuts.Drop, this);
  }

  private get storageKey() {
    return `${storageKeyPrefix}.${this.settings.game}.state`;
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.player.save()));
  }

  load() {
    try {
      const json = localStorage.getItem(this.storageKey);

      if (!json) return false;

      this.player = Player.load(JSON.parse(json), this);

      return true;
    } catch (e) {
      this.lastError = (e as Error).message;

      return false;
    }
  }

  execute(action: () => void, silent: boolean) {
    if (!silent) return action();

    this._suppressOutput++;

    try {
      return action();
    } finally {
      this._suppressOutput--;
    }
  }
}
