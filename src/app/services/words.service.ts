import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { AssetService } from './asset.service';
import { SettingsService } from './settings.service';

const wordReg = /^#([^\s]+)\s*=\s*\((.+)\)$/;

type CommandMap = Record<string, Command>;

class Command {
  objectKeys = new Set<string>();

  keys = new Set<string>();

  readonly next: CommandMap = {};
}

@Injectable()
export class WordsService implements OnDestroy {
  lastError = '';

  parsing = false;

  private readonly _commands$ = new BehaviorSubject<CommandMap>({});

  readonly commands$ = this._commands$.asObservable();

  constructor(
    private readonly _settings: SettingsService,
    private readonly _assets: AssetService
  ) {}

  ngOnDestroy(): void {
    this._commands$.complete();
  }

  parse() {
    this.lastError = '';
    this.parsing = true;

    this._commands$.next({});

    this._assets
      .download(`${this._settings.game}.words`)
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
    lines = lines.map((l) => l.trim()).filter((l) => l);

    for (let i = lines.length; i-- > 0; )
      if (!lines[i].startsWith('#')) {
        lines[i - 1] += lines[i];

        lines.splice(i, 1);
      }

    for (const line of lines) {
      const match = wordReg.exec(line);

      if (!match) throw new Error(`bad word definition: ${line}`);

      const key = match[1];

      for (const alternative of match[2].split(',')) {
        const commands = this._commands$.value;

        this.addCommand(alternative, key, commands);

        this._commands$.next(commands);
      }
    }

    this._commands$.next(this._commands$.value);
  }

  private addCommand(alternative: string, key: string, commands: CommandMap) {
    const final = alternative.endsWith('!');

    if (final) alternative = alternative.substring(0, alternative.length - 1);

    this.addCommandParts(alternative.split('.'), commands, key, final);
  }

  private addCommandParts(
    parts: string[],
    commands: CommandMap,
    key: string,
    final: boolean
  ) {
    let part = parts[0];

    if (!part) return;

    const optional = part.startsWith('|');

    if (optional) {
      part = part.substring(1);

      this.addCommandParts(parts.slice(1), commands, key, final);
    }

    for (const word of part.split('+')) {
      let command = commands[word];

      if (!command) commands[word] = command = new Command();

      if (parts.length > 1)
        this.addCommandParts(
          parts.slice(1),
          command.next,
          key,
          final && word !== '%'
        );
      else {
        const prop = final ? 'keys' : 'objectKeys';

        command[prop].add(key);
      }
    }
  }
}
