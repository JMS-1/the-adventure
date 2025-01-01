import { Injectable, OnDestroy } from '@angular/core';
import { ReplaySubject, tap } from 'rxjs';
import { TActionMap } from '../actions';
import { Time } from '../game-object/time';
import { Weight } from '../game-object/weight';
import { ActionService } from './action.service';
import { AssetService } from './asset.service';
import { SettingsService } from './settings.service';

const regs = {
  actions: /^\s*actions\s*=\s*(.*)$/,
  command: /^\s*#([^\s=]+)\s*=\s*(.*)$/,
  exits: /^\s*exits\s*=\s*(.*)$/,
  key: /^\s*([^=])\s*=\s*#(.+)$/,
  message: /^\s*message\s*=\s*(.*)$/,
  state: /^\s*state\s*=\s*(.*)$/,
  time: /^\s*time\s*=\s*(.*)$/,
  weight: /^\s*weight\s*=\s*(.*)$/,
};

@Injectable()
export class DefaultsService implements OnDestroy {
  private readonly _parseDone$ = new ReplaySubject<string>(1);

  readonly parseDone$ = this._parseDone$.asObservable();

  actions: TActionMap = {};

  exits: TActionMap = {};

  readonly commands: TActionMap = {};

  message = '*';

  weight = new Weight('(0,0,0)');

  time = new Time('(d0/0,h0/0,m0/1)');

  readonly keyMap: Record<string, string> = {};

  state = '';

  constructor(
    private readonly _settings: SettingsService,
    private readonly _assets: AssetService,
    private readonly _parser: ActionService
  ) {}

  parse() {
    this._assets
      .download(`${this._settings.game}.defaults`)
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
    lines = lines
      .map((l) => (l.startsWith(';') ? '' : l.trim()))
      .filter((l) => l);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      let match = regs.message.exec(line);

      if (match) {
        this.message = match[1];
      } else if ((match = regs.weight.exec(line))) {
        this.weight = new Weight(match[1]);
      } else if ((match = regs.time.exec(line))) {
        this.time = new Time(match[1]);
      } else if ((match = regs.state.exec(line))) {
        this.state = match[1];
      } else if ((match = regs.key.exec(line))) {
        this.keyMap[match[2]] = match[1];
      } else if ((match = regs.command.exec(line))) {
        const parsed = this._parser.parse(match[2], lines, i);

        i = parsed[1];

        this.commands[match[1]] = parsed[0][''];
      } else if ((match = regs.actions.exec(line))) {
        const actions = this._parser.parseMultiple(match[1], lines, i);

        i = actions[1];

        this.actions = { ...this.actions, ...actions[0] };
      } else if ((match = regs.exits.exec(line))) {
        const exits = this._parser.parseMultiple(match[1], lines, i);

        i = exits[1];

        this.exits = { ...this.exits, ...exits[0] };
      } else {
        throw new Error(line);
      }
    }
  }
}
