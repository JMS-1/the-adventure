import { Injectable, OnDestroy } from '@angular/core';
import { ReplaySubject, tap } from 'rxjs';
import { AssetService } from '../services/asset.service';
import { SettingsService } from '../services/settings.service';
import { Command, CommandMap } from './command';
import { CommandAnalyser } from './command-analyser';

/** '#' <command> '=' <command rule> */
const wordReg = /^#([a-zA-Z0-9äöüß_]+)\s*=\s*\((.+)\)$/;

/** Management of commands. */
@Injectable()
export class CommandService implements OnDestroy {
  /** Signaled with an error or empty as soon as file parsing has been done. */
  private readonly _parseDone$ = new ReplaySubject<string>(1);

  readonly parseDone$ = this._parseDone$.asObservable();

  /** All command declarations. */
  readonly commands: CommandMap = {};

  /**
   * Create a new manager.
   *
   * @param _settings overall configuration.
   * @param _assets file access helper.
   */
  constructor(
    private readonly _settings: SettingsService,
    private readonly _assets: AssetService
  ) {}

  /** Load the command declaration file an analyse it. */
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

  /** Analyse the content the declaration file. */
  private parseFile(lines: string[]) {
    /** Just ignore empty lines. */
    lines = lines.map((l) => l.trim()).filter((l) => l);

    /** Merge multi-line declarations in a single one. */
    for (let i = lines.length; i-- > 0; )
      if (!lines[i].startsWith('#')) {
        lines[i - 1] += lines[i];

        lines.splice(i, 1);
      }

    for (const line of lines) {
      /** Check for correct declaration pattern. */
      const match = wordReg.exec(line);

      if (!match) throw new Error(`bad word definition: ${line}`);

      const key = match[1];

      /** Proceess all variants - separated by comma. */
      for (const alternative of match[2].toLowerCase().split(','))
        this.addCommand(alternative, key, this.commands);
    }
  }

  /**
   * Process a single command alternative.
   *
   * @param alternative full alternative.
   * @param key command name.
   * @param commands where to register command - finally there will be a command tree.
   */
  private addCommand(alternative: string, key: string, commands: CommandMap) {
    /** If the alternative starts with exclamation no entity name will be assumed at the very end. */
    const final = alternative.endsWith('!');

    if (final) alternative = alternative.substring(0, alternative.length - 1);

    /** Process all parts of the alternative - separated by dots. */
    this.addCommandParts(alternative.split('.'), commands, key, final);
  }

  /**
   * Process the parts of a single alternative.
   *
   * @param parts alternative split by dots in parts.
   * @param commands where to register the command in the tree.
   * @param key command to register.
   * @param final set if the command should not be auto-terminated by a entity.
   */
  private addCommandParts(
    parts: string[],
    commands: CommandMap,
    key: string,
    final: boolean
  ) {
    /** Check the first part of the command. */
    let part = parts[0];

    if (!part) return;

    /** May be marked as optional - user can just not enter the word. */
    const optional = part.startsWith('|');

    if (optional) {
      part = part.substring(1);

      /** If optional add the next part to the current tree level. */
      this.addCommandParts(parts.slice(1), commands, key, final);
    }

    /** Process alternate words of the part - separated by plus. */
    for (const word of part.split('+')) {
      /** Generate a new tree node if necessary. */
      let command = commands[word];

      if (!command) commands[word] = command = new Command();

      if (parts.length > 1)
        /** Enter the next level of processing - high potential of optimisation since call for each alternate word but no problem right now. */
        this.addCommandParts(
          parts.slice(1),
          command.next,
          key,
          final && word !== '%'
        );
      /** Register the command on the position inside the tree. */ else if (
        final
      )
        command.keys.add(key);
      else command.objectKeys.add(key);
    }
  }

  /**
   * Analyse some input.
   *
   * @param cmd input from the user.
   * @param entities all visible entities which can be addressed.
   * @returns all matching commands
   */
  *analyseCommand(cmd: string, entities: Record<string, string>) {
    const analyser = new CommandAnalyser(cmd);

    for (const command of analyser.analyse(this.commands, entities))
      yield command;
  }
}
