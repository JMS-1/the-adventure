import { Injectable, OnDestroy } from '@angular/core';
import { ReplaySubject, tap } from 'rxjs';
import { ActionService } from './action.service';
import { AssetService } from './asset.service';
import { SettingsService } from './settings.service';

const regs = {
  actions: /^\s*actions\s*=\s*(.*)$/,
  command: /^\s*#([^\s=]+)\s*=\s*(.*)$/,
  exits: /^\s*exits\s*=\s*(.*)$/,
  keys: /^\s*([^=])\s*=\s*#(.+)$/,
  message: /^\s*message\s*=(.*)$/,
  persons: /^\s*persons\s*=\s*(.*)$/,
  state: /^\s*state\s*=(.*)$/,
  things: /^\s*things\s*=\s*(.*)$/,
  time: /^\s*time\s*=\s*(.*)$/,
  weight: /^\s*weight\s*=\s*(.*)$/,
};

@Injectable()
export class DefaultsService implements OnDestroy {
  private readonly _parseDone$ = new ReplaySubject<string>(1);

  readonly parseDone$ = this._parseDone$.asObservable();

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
        this.processMessage(match[1]);
      } else if ((match = regs.things.exec(line))) {
        this.processThings(match[1]);
      } else if ((match = regs.persons.exec(line))) {
        this.processPersons(match[1]);
      } else if ((match = regs.weight.exec(line))) {
        this.processWeight(match[1]);
      } else if ((match = regs.time.exec(line))) {
        this.processTime(match[1]);
      } else if ((match = regs.state.exec(line))) {
        this.processState(match[1]);
      } else if ((match = regs.keys.exec(line))) {
        this.processKey(match[1], match[2]);
      } else if ((match = regs.command.exec(line))) {
        i = this._parser.parse(match[2], lines, i)[1];
      } else if ((match = regs.actions.exec(line))) {
        i = this._parser.parseMultiple(match[1], lines, i)[1];
      } else if ((match = regs.exits.exec(line))) {
        i = this._parser.parseMultiple(match[1], lines, i)[1];
      } else {
        throw new Error(line);
      }
    }
  }

  private processState(state: string) {
    console.log('state=' + state);
  }

  private processKey(key: string, command: string) {
    console.log(key + '=' + command);
  }

  private processMessage(msg: string) {
    console.log('message=' + msg);
  }

  private processTime(time: string) {
    console.log('time=' + time);
  }

  private processWeight(weight: string) {
    console.log('weight=' + weight);
  }

  private processThings(things: string) {
    console.log('things=' + things);
  }

  private processPersons(persons: string) {
    console.log('persons=' + persons);
  }
}
