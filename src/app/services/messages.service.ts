import { Injectable, OnDestroy } from '@angular/core';
import { ReplaySubject, tap } from 'rxjs';
import { AssetService } from './asset.service';
import { SettingsService } from './settings.service';

const messageReg = /^\$([^/]+)(\/(\d{1,2}))?$/;

@Injectable()
export class MessagesService implements OnDestroy {
  private readonly _parseDone$ = new ReplaySubject<string>(1);

  readonly parseDone$ = this._parseDone$.asObservable();

  messageMap: Record<string, string[]> = {};

  private _parseDepth = 0;

  private _objectName = '';

  private _messageName = '';

  private _messageIndex = 0;

  private _messages: string[] = [];

  constructor(
    private readonly _settings: SettingsService,
    private readonly _assets: AssetService
  ) {}

  parse() {
    this.processFile(`${this._settings.game}.msg`);
  }

  ngOnDestroy(): void {
    this._parseDone$.complete();
  }

  private processFile(name: string) {
    this._parseDepth++;

    this._assets
      .download(name)
      .pipe(tap((s) => this.parseFile(s.replace(/\r/g, '').split('\n'))))
      .subscribe({
        error: (e) => !--this._parseDepth && this._parseDone$.next(e.message),
        complete: () => !--this._parseDepth && this._parseDone$.next(''),
      });
  }

  private parseFile(lines: string[]) {
    for (let line of lines) {
      line = line.trim();

      if (!line) continue;

      if (line.startsWith('$$$')) {
        this.processFile(line.substring(3));

        continue;
      }

      if (line.startsWith('$$')) {
        this._objectName = line.substring(2);
        this._messageName = '';

        continue;
      }

      if (!this._objectName) throw new Error(`no object for ${line}`);

      const match = messageReg.exec(line);

      if (match) {
        if (this._messageName !== match[1]) {
          this._messageName = match[1];
          this._messages = [];

          this.messageMap[`${this._objectName}.${this._messageName}`] =
            this._messages;
        }

        this._messageIndex = match[3] ? parseInt(match[3]) : 1;

        continue;
      }

      if (!this._messageName) throw new Error(`no message for ${line}`);

      this._messages[this._messageIndex - 1] = [
        this._messages[this._messageIndex - 1],
        line,
      ]
        .filter((m) => m)
        .join(' ');
    }
  }
}
