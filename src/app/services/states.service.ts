import { Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { ActionService } from './action.service';
import { AssetService } from './asset.service';
import { SettingsService } from './settings.service';

const regs = {
  actions: /^\s*actions\s*=\s*(.*)$/,
  exits: /^\s*exits\s*=\s*(.*)$/,
  message: /^\s*message\s*=(.*)$/,
  persons: /^\s*persons\s*=\s*(.*)$/,
  things: /^\s*things\s*=\s*(.*)$/,
};

@Injectable()
export class StatesService {
  lastError = '';

  parsing = false;

  private _objectName?: string;

  private _areaName?: string;

  constructor(
    private readonly _settings: SettingsService,
    private readonly _assets: AssetService,
    private readonly _parser: ActionService
  ) {}

  parse() {
    this.lastError = '';
    this.parsing = true;

    this._assets
      .download(`${this._settings.game}.states`)
      .pipe(tap((s) => this.parseFile(s.replace(/\r/g, '').split('\n'))))
      .subscribe({
        error: (e) => {
          this.lastError = e.message;
          this.parsing = false;
        },
        complete: () => (this.parsing = false),
      });
  }

  private parseFile(lines: string[]) {
    this._objectName = undefined;

    lines = lines
      .map((l) => (l.startsWith(';') ? '' : l.trim()))
      .filter((l) => l);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('$$')) {
        this._areaName = line.substring(2);
        this._objectName = undefined;

        continue;
      }

      if (!this._areaName) throw new Error('area missing');

      if (line.startsWith('$')) {
        this._objectName = line.substring(1);

        console.log(this._areaName + ':' + this._objectName);

        continue;
      }

      if (!this._objectName) throw new Error('object scope missing');

      let match = regs.message.exec(line);

      if (match) {
        this.processMessage(match[1]);
      } else if ((match = regs.things.exec(line))) {
        this.processThings(match[1]);
      } else if ((match = regs.persons.exec(line))) {
        this.processPersons(match[1]);
      } else if ((match = regs.actions.exec(line))) {
        i = this._parser.parseMultiple(match[1], lines, i)[1];
      } else if ((match = regs.exits.exec(line))) {
        i = this._parser.parseMultiple(match[1], lines, i)[1];
      } else {
        throw new Error(line);
      }
    }
  }

  private processMessage(msg: string) {
    console.log('message=' + msg);
  }

  private processThings(things: string) {
    console.log('things=' + things);
  }

  private processPersons(persons: string) {
    console.log('persons=' + persons);
  }
}
