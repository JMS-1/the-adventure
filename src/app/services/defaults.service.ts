import { Injectable, OnDestroy } from '@angular/core';
import { ReplaySubject, tap } from 'rxjs';
import { TActionMap } from '../actions';
import { Time } from '../game-object/time';
import { Weight } from '../game-object/weight';
import { ActionService } from './action.service';
import { AssetService } from './asset.service';
import { SettingsService } from './settings.service';

/** Patterns to detect default settings. */
const regs = {
  actions: /^\s*actions\s*=\s*(.*)$/,
  command: /^\s*#([a-zA-Z0-9äöüß_]+)\s*=\s*(.*)$/,
  exits: /^\s*exits\s*=\s*(.*)$/,
  key: /^\s*([^=])\s*=\s*#([a-zA-Z0-9äöüß_]+)\s*$/,
  message: /^\s*message\s*=\s*([a-zA-Z0-9*äöüß_]+)\s*$/,
  room: /^\s*state\s*=\s*(.*)$/,
  time: /^\s*time\s*=\s*(.*)$/,
  weight: /^\s*weight\s*=\s*(.*)$/,
};

/** Provide all default values. */
@Injectable()
export class DefaultsService implements OnDestroy {
  /** Set to empty or an error message after defaults file is processed. */
  private readonly _parseDone$ = new ReplaySubject<string>(1);

  readonly parseDone$ = this._parseDone$.asObservable();

  /** Default actions for rooms. */
  readonly actions: TActionMap = {};

  /** Default exists for rooms. */
  readonly exits: TActionMap = {};

  /** Default commands for entities. */
  readonly commands: TActionMap = {};

  /** Default message for every game object. */
  message = '*';

  /** Strength of the player. */
  weight = new Weight('(0,0,0)');

  /** Initial game time and increment. */
  time = new Time('(d0/0,h0/0,m0/1)');

  /** All shotcuts mapped to commands. */
  readonly keyMap: Record<string, string> = {};

  /** Initial room. */
  room = '';

  /**
   * Create a new service.
   *
   * @param _settings overall settings.
   * @param _assets service to load files.
   * @param _parser action parser.
   */
  constructor(
    private readonly _settings: SettingsService,
    private readonly _assets: AssetService,
    private readonly _parser: ActionService
  ) {}

  /** Load the defaults file and analyse it. */
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

  /**
   * Analyse the defaults file.
   *
   * @param lines all lines in the file.
   */
  private parseFile(lines: string[]) {
    /** Skip comment and empty lines - leading and trailing whitespaces will be removed. */
    lines = lines
      .map((l) => (l.startsWith(';') ? '' : l.trim()))
      .filter((l) => l);

    for (let i = 0; i < lines.length; i++) {
      /** Analyse each line - lines will be merged as needed. */
      const line = lines[i];

      let match = regs.message.exec(line);

      if (match) {
        this.message = match[1];
      } else if ((match = regs.weight.exec(line))) {
        this.weight = new Weight(match[1]);
      } else if ((match = regs.time.exec(line))) {
        this.time = new Time(match[1]);
      } else if ((match = regs.room.exec(line))) {
        this.room = match[1];
      } else if ((match = regs.key.exec(line))) {
        this.keyMap[match[2]] = match[1];
      } else if ((match = regs.command.exec(line))) {
        const command = this._parser.parse(match[2], lines, i);

        i = command[1];

        /** Contrary to actions and exists the action key is on the left side of the action declaration for a command. */
        this.mergeActions({ [match[1]]: command[0][''] }, this.commands);
      } else if ((match = regs.actions.exec(line))) {
        const actions = this._parser.parseMultiple(match[1], lines, i);

        i = actions[1];

        /** Allow to have multiple action declaration lines. */
        this.mergeActions(actions[0], this.actions);
      } else if ((match = regs.exits.exec(line))) {
        const exits = this._parser.parseMultiple(match[1], lines, i);

        i = exits[1];

        /** Allow to have multiple exit declaration lines. */
        this.mergeActions(exits[0], this.exits);
      } else {
        /** Not a recognized declaration format. */
        throw new Error(line);
      }
    }
  }

  /**
   * Merge a read map of actions into the existing map.
   *
   * @param from actions from the declaration line.
   * @param to actions collected to far.
   */
  private mergeActions(from: TActionMap, to: TActionMap) {
    for (const action of Object.keys(from))
      to[action] = [...(to[action] || []), ...from[action]];
  }
}
