import { Injectable, OnDestroy } from '@angular/core';
import { concat, ReplaySubject, tap } from 'rxjs';
import { TActionMap } from '../actions';
import { Entity, EntityMap } from '../game-object/entity';
import { Macro } from '../game-object/macro';
import { Person } from '../game-object/person';
import { Thing } from '../game-object/thing';
import { ActionService } from './action.service';
import { AssetService } from './asset.service';
import { SettingsService } from './settings.service';

/** The entity manager. */
@Injectable()
export class ObjectsService implements OnDestroy {
  /** Set to empty or any error when all configuration files are processed. */
  private readonly _parseDone$ = new ReplaySubject<string>(1);

  readonly parseDone$ = this._parseDone$.asObservable();

  /** The entity currently configured. */
  private _current?: Entity;

  /** Alle entities declared. */
  readonly entities: EntityMap<Entity> = {};

  /** All macros in the current configuration file. */
  private _macros: EntityMap<Macro> = {};

  /** Factory to create an entity - maybe thing or person. */
  private _factory: new (
    name: string,
    words: string,
    macro: Macro | null
  ) => Entity = Person;

  /**
   * Remember an entity or macro.
   *
   * @param entityOrMacro entity or macro.
   * @param map where to remember.
   */
  private addToMap(entityOrMacro: Entity, map = this.entities) {
    if (map[entityOrMacro.name])
      throw new Error(`duplicate entity or macro '${entityOrMacro.name}`);

    map[entityOrMacro.name] = this._current = entityOrMacro;
  }

  /**
   * Parse actions.
   *
   * @param start rest of the first line to process.
   * @param lines all lines from a definition file.
   * @param i index of the current line.
   * @param parse how to parse.
   * @param set method to report the parsed actions to some entity property.
   * @returns index of the next line to process.
   */
  private parseActions(
    start: string,
    lines: string[],
    i: number,
    parse: 'parseMultiple' | 'parse',
    set: (actions: TActionMap) => void
  ) {
    const actions = this._parser[parse](start, lines, i);

    set(actions[0]);

    return actions[1];
  }

  /** Map of all patterns and related parsing methods. */
  private readonly _parsers: [
    RegExp,
    (match: RegExpMatchArray, lines: string[], i: number) => void | number
  ][] = [
    /** Order required. */
    /** Start defining a macro. */
    [
      /^\$\$macro\s+([a-zA-Z0-9äöüß]+)$/,
      (m) => this.addToMap(new Macro(m[1]), this._macros),
    ],
    [
      /** Create entity from macro - mostly add all names that can be used to address it. */
      /^\$\$([a-zA-Z0-9äöüß]+)\s+([a-zA-Z0-9äöüß_]+)(\s+(.*))?$/,
      (m) => {
        const macro = this._macros[m[1]];

        if (!macro) throw new Error(`macro ${m[1]} not found`);

        this.addToMap(new this._factory(m[2], m[3], macro));

        /** Actually there is no longer an entity being processed - all configuration must come from the macro. */
        this._current = undefined;
      },
    ],
    /** Start parsing an entity. */
    [
      /^\$([a-zA-Z0-9äöüß_]+)(\s+(.*))?$/,
      (m) => this.addToMap(new this._factory(m[1], m[2], null)),
    ],
    /** Can have any order from now on. */
    /** Actions of the current entity. */
    [
      /^\s*actions\s*=\s*(.*)$/,
      (m, lines, i) =>
        this.parseActions(m[1], lines, i, 'parseMultiple', (actions) =>
          this._current!.addActions(actions)
        ),
    ],
    /** Command if an entity. */
    [
      /^\s*#([a-zA-Z0-9äöüß_]+)\s*=\s*(.*)$/,
      (m, lines, i) =>
        this.parseActions(m[2], lines, i, 'parse', (actions) =>
          this._current!.addCommand(m[1], actions[''])
        ),
    ],
    /** Inital message of the entity. */
    [
      /^\s*message\s*=\s*([a-zA-Z0-9*äöüß_]*)\s*$/,
      (m) => this._current!.setMessage(m[1]),
    ],
    /** Add list of persons. */
    [/^\s*persons\s*=\s*(.*)$/, (m) => this._current!.setPersons(m[1])],
    /** Add list of things. */
    [/^\s*things\s*=\s*(.*)$/, (m) => this._current!.setThings(m[1])],
    /** Add timers to the entity. */
    [
      /^\s*time\s*=\s*(.*)$/,
      (m, lines, i) =>
        this.parseActions(m[1], lines, i, 'parseMultiple', (actions) =>
          this._current!.addTimes(actions)
        ),
    ],
    /** Define the weight of the entity. */
    [/^\s*weight\s*=\s*(.*)$/, (m) => this._current!.setWeight(m[1])],
  ];

  /**
   * Create a new entity manager.
   *
   * @param _settings overall settings.
   * @param _assets file access helper.
   * @param _parser action parser.
   */
  constructor(
    private readonly _settings: SettingsService,
    private readonly _assets: AssetService,
    private readonly _parser: ActionService
  ) {}

  /** Start parsing the declaration files of persons and things. */
  parse() {
    concat(
      this._assets.download(`${this._settings.game}.persons`),
      this._assets.download(`${this._settings.game}.things`)
    )
      .pipe(tap((s) => this.parseFile(s.replace(/\r/g, '').split('\n'))))
      .subscribe({
        error: (e) => this._parseDone$.next(e.message),
        complete: () => this._parseDone$.next(''),
      });
  }

  ngOnDestroy(): void {
    this._parseDone$.complete();
  }

  /**
   * Process a single declaration file.
   *
   * @param lines Lines of the file.
   */
  private parseFile(lines: string[]) {
    /** Reset parsing state - no current entity, no macros. */
    this._current = undefined;
    this._macros = {};

    /** Get rid of comment and empty lines - for other lines leading and trailing whitespaces will be discarded. */
    lines = lines
      .map((l) => (l.startsWith(';') ? '' : l.trim()))
      .filter((l) => l);

    for (let i = 0; i < lines.length; i++) {
      /** See if there is a parser available fpr the current line. */
      const line = lines[i];

      let match: RegExpExecArray | null = null;

      for (const [parse, compile] of this._parsers) {
        match = parse.exec(line);

        if (match) {
          /** Use parser found to parse the line - may need to merge in following lines so the current index may change. */
          i = compile(match, lines, i) ?? i;

          break;
        }
      }

      /** No parser found. */
      if (!match) throw new Error(line);
    }

    /** We start paring the persons and continue with things - see parse() for correct order of file. */
    this._factory = Thing;
  }

  /**
   * Find an entity.
   *
   * @param name name of the entity.
   * @returns the entity - will throw an error if entity is not known.
   */
  findEntity(name: string) {
    const entity = this.entities[name];

    if (!entity) throw new Error(`can not find thing or person ${name}`);

    return entity;
  }
}
