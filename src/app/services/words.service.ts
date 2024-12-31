import { Injectable, OnDestroy } from '@angular/core';
import { ReplaySubject, tap } from 'rxjs';
import { AssetService } from './asset.service';
import { Command, CommandMap } from './command';
import { CommandAnalyser } from './commandAnalyser';
import { SettingsService } from './settings.service';

const wordReg = /^#([^\s]+)\s*=\s*\((.+)\)$/;

@Injectable()
export class WordsService implements OnDestroy {
  private readonly _parseDone$ = new ReplaySubject<string>(1);

  readonly parseDone$ = this._parseDone$.asObservable();

  commands: CommandMap = {};

  constructor(
    private readonly _settings: SettingsService,
    private readonly _assets: AssetService
  ) {}

  parse() {
    this._assets
      .download(`${this._settings.game}.words`)
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

      for (const alternative of match[2].toLowerCase().split(','))
        this.addCommand(alternative, key, this.commands);
    }
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

  *analyseCommand(cmd: string) {
    const analyser = new CommandAnalyser(cmd);

    for (const command of analyser.analyse(this.commands)) yield command;
  }
}
