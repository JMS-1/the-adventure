import { Injectable, OnDestroy, inject } from '@angular/core';
import { ReplaySubject, tap } from 'rxjs';
import { TActionMap } from '../actions';
import { Room } from '../game-object/room';
import { ActionService } from './action.service';
import { AssetService } from './asset.service';
import { SettingsService } from './settings.service';

@Injectable()
export class RoomsService implements OnDestroy {
  private readonly _settings = inject(SettingsService);
  private readonly _assets = inject(AssetService);
  private readonly _parser = inject(ActionService);

  private readonly _parseDone$ = new ReplaySubject<string>(1);

  readonly parseDone$ = this._parseDone$.asObservable();

  private _current?: Room;

  private _areaName?: string;

  readonly rooms: Record<string, Room> = {};

  private addRoom(room: Room) {
    if (this.rooms[room.key]) throw new Error(`duplicate room '${room.key}`);

    this.rooms[room.key] = this._current = room;
  }

  private parseActions(
    match: string,
    lines: string[],
    i: number,
    set: (actions: TActionMap) => void
  ) {
    const actions = this._parser.parseMultiple(match, lines, i);

    set(actions[0]);

    return actions[1];
  }

  private readonly _parsers: [
    RegExp,
    (match: RegExpMatchArray, lines: string[], i: number) => void | number
  ][] = [
    /* Order required. */
    [
      /^\$\$([a-zA-Z0-9äöüß_]+)\s*$/,
      (m) => {
        this._areaName = m[1];
        this._current = undefined;
      },
    ],
    [
      /^\$([a-zA-Z0-9äöüß_]+)\s*$/,
      (m) => this.addRoom(new Room(this._areaName!, m[1])),
    ],
    /* Can have any order. */
    [
      /^\s*actions\s*=\s*(.*)$/,
      (m, lines, i) =>
        this.parseActions(m[1], lines, i, (actions) =>
          this._current!.addActions(actions)
        ),
    ],
    [
      /^\s*exits\s*=\s*(.*)$/,
      (m, lines, i) =>
        this.parseActions(m[1], lines, i, (actions) =>
          this._current!.addExits(actions)
        ),
    ],
    [/^\s*message\s*=(.*)$/, (m) => this._current!.setMessage(m[1])],
    [/^\s*persons\s*=\s*(.*)$/, (m) => this._current!.setPersons(m[1])],
    [/^\s*things\s*=\s*(.*)$/, (m) => this._current!.setThings(m[1])],
  ];

  parse() {
    this._assets
      .download(`${this._settings.game}.states`)
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
  }
}
