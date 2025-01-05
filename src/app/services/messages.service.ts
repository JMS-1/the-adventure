import { Injectable, OnDestroy } from '@angular/core';
import { ReplaySubject, tap } from 'rxjs';
import { AssetService } from './asset.service';
import { SettingsService } from './settings.service';

/** <message> [ '/' <1..99> ] */
const messageReg = /^\$([a-zA-Z0-9*äöüß_]+)(\/([1-9]\d?))?$/;

/** Provides all message texts. */
@Injectable()
export class MessagesService implements OnDestroy {
  /** Set to empty or any error when parsing all message files is finished. */
  private readonly _parseDone$ = new ReplaySubject<string>(1);

  readonly parseDone$ = this._parseDone$.asObservable();

  /** All messages. */
  readonly messageMap: Record<string, string[]> = {};

  /** Current depth of include files. */
  private _parseDepth = 0;

  /** Current message scope - name of an entity or room. */
  private _objectName = '';

  /** Current message. */
  private _messageName = '';

  /** Current index in the array of alternate messages. */
  private _messageIndex = 0;

  /** Current collection of alternatives. */
  private _messages: string[] = [];

  /**
   * Create a new service.
   *
   * @param _settings overall settings.
   * @param _assets access to files.
   */
  constructor(
    private readonly _settings: SettingsService,
    private readonly _assets: AssetService
  ) {}

  /** Start parsing messages beginning with the global message file. */
  parse() {
    this.processFile(`${this._settings.game}.msg`);
  }

  ngOnDestroy(): void {
    this._parseDone$.complete();
  }

  /** Process a single message file. */
  private processFile(name: string) {
    /** Incremented on each include - staring with 1 for the initial global message file. */
    this._parseDepth++;

    this._assets
      .download(name)
      .pipe(tap((s) => this.parseFile(s.replace(/\r/g, '').split('\n'))))
      .subscribe({
        error: (e) => !--this._parseDepth && this._parseDone$.next(e.message),
        complete: () => !--this._parseDepth && this._parseDone$.next(''),
      });
  }

  /**
   * Inspect a single message file.
   *
   * @param lines content of the file.
   */
  private parseFile(lines: string[]) {
    for (let line of lines) {
      /** Skip empty lines. */
      line = line.trim();

      if (!line) continue;

      /** Merge in the contents of another message file. */
      if (line.startsWith('$$$')) {
        this.processFile(line.substring(3));

        continue;
      }

      /** Start a new entity or room. */
      if (line.startsWith('$$')) {
        this._objectName = line.substring(2);
        this._messageName = '';

        continue;
      }

      /** Check for the name of the message - game object scope must be defined prior to this.*/
      if (!this._objectName) throw new Error(`no object for ${line}`);

      const match = messageReg.exec(line);

      if (match) {
        /** See if a new message starts. */
        if (this._messageName !== match[1]) {
          /** Prepare the message definitions. */
          this._messageName = match[1];
          this._messages = [];

          this.messageMap[`${this._objectName}.${this._messageName}`] =
            this._messages;
        }

        /** Set the index of the message - first message variant gets the more natural 1, not 0. */
        this._messageIndex = match[3] ? parseInt(match[3]) : 1;

        continue;
      }

      /** Merge in message text - the message name must be already be known. */
      if (!this._messageName) throw new Error(`no message for ${line}`);

      /** Merge the message variant into a single line - separated by a single space. */
      this._messages[this._messageIndex - 1] = [
        this._messages[this._messageIndex - 1],
        line,
      ]
        .filter((m) => m)
        .join(' ');
    }
  }
}
