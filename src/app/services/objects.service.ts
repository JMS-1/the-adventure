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

@Injectable()
export class ObjectsService implements OnDestroy {
  private readonly _parseDone$ = new ReplaySubject<string>(1);

  readonly parseDone$ = this._parseDone$.asObservable();

  private _current?: Entity;

  readonly entities: EntityMap<Entity> = {};

  private _macros: EntityMap<Macro> = {};

  private _factory: new (
    name: string,
    words: string,
    macro: Macro | null
  ) => Entity = Person;

  private addToMap(what: Entity, map = this.entities) {
    if (map[what.name]) throw new Error(`duplicate object '${what.name}`);

    map[what.name] = this._current = what;
  }

  private parseActions(
    match: string,
    lines: string[],
    i: number,
    parse: 'parseMultiple' | 'parse',
    set: (actions: TActionMap) => void
  ) {
    const actions = this._parser[parse](match, lines, i);

    set(actions[0]);

    return actions[1];
  }

  private readonly _parsers: [
    RegExp,
    (match: RegExpMatchArray, lines: string[], i: number) => void | number
  ][] = [
    /* Order required. */
    [
      /^\$\$macro\s+([a-zA-Z0-9äöüß]+)$/,
      (m) => this.addToMap(new Macro(m[1]), this._macros),
    ],
    [
      /^\$\$([a-zA-Z0-9äöüß]+)\s+([a-zA-Z0-9äöüß_]+)(\s+(.*))?$/,
      (m) => {
        const macro = this._macros[m[1]];

        if (!macro) throw new Error(`macro ${m[1]} not found`);

        this.addToMap(new this._factory(m[2], m[3], macro));

        this._current = undefined;
      },
    ],
    [
      /^\$([a-zA-Z0-9äöüß_]+)(\s+(.*))?$/,
      (m) => this.addToMap(new this._factory(m[1], m[2], null)),
    ],
    /* Can have any order. */
    [
      /^\s*actions\s*=\s*(.*)$/,
      (m, lines, i) =>
        this.parseActions(m[1], lines, i, 'parseMultiple', (actions) =>
          this._current!.addActions(actions)
        ),
    ],
    [
      /^\s*#([a-zA-Z0-9äöüß_]+)\s*=\s*(.*)$/,
      (m, lines, i) =>
        this.parseActions(m[2], lines, i, 'parse', (actions) =>
          this._current!.addCommand(m[1], actions[''])
        ),
    ],
    [/^\s*message\s*=(.*)$/, (m) => this._current!.setMessage(m[1])],
    [/^\s*persons\s*=\s*(.*)$/, (m) => this._current!.setPersons(m[1])],
    [/^\s*things\s*=\s*(.*)$/, (m) => this._current!.setThings(m[1])],
    [
      /^\s*time\s*=\s*(.*)$/,
      (m, lines, i) =>
        this.parseActions(m[1], lines, i, 'parseMultiple', (actions) =>
          this._current!.addTimes(actions)
        ),
    ],
    [/^\s*weight\s*=\s*(.*)$/, (m) => this._current!.setWeight(m[1])],
  ];

  constructor(
    private readonly _settings: SettingsService,
    private readonly _assets: AssetService,
    private readonly _parser: ActionService
  ) {}

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

  private parseFile(lines: string[]) {
    this._current = undefined;
    this._macros = {};

    lines = lines
      .map((l) => (l.startsWith(';') ? '' : l.trim()))
      .filter((l) => l);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      let match: RegExpExecArray | null = null;

      for (const [parse, compile] of this._parsers) {
        match = parse.exec(line);

        if (match) {
          i = compile(match, lines, i) ?? i;

          break;
        }
      }

      if (!match) throw new Error(line);
    }

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
