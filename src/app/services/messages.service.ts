import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, map, tap } from 'rxjs';
import { AssetService } from './asset.service';
import { SettingsService } from './settings.service';

const messageReg = /^\$([^/]+)(\/(\d{1,2}))?$/;

@Injectable()
export class MessagesService implements OnDestroy {
  private readonly _parsing$ = new BehaviorSubject(0);

  readonly parsing$ = this._parsing$.pipe(map((n) => n > 0));

  private readonly _messageMap$ = new BehaviorSubject<Record<string, string[]>>(
    {}
  );

  public readonly messages$ = this._messageMap$.asObservable();

  lastError = '';

  private _objectName = '';

  private _messageName = '';

  private _messageIndex = 0;

  private _messages: string[] = [];

  constructor(
    private readonly _settings: SettingsService,
    private readonly _assets: AssetService
  ) {}

  ngOnDestroy(): void {
    this._parsing$.complete();
  }

  parse() {
    this.lastError = '';
    this._objectName = '';

    this._parsing$.next(0);
    this._messageMap$.next({});

    this.processFile(`${this._settings.game}.msg`);
  }

  private processFile(name: string) {
    this._parsing$.next(this._parsing$.value + 1);

    this._assets
      .download(name)
      .pipe(tap((s) => this.parseFile(s.replace(/\r/g, '').split('\n'))))
      .subscribe({
        error: (e) => {
          this.lastError = e.message;
          this._parsing$.next(this._parsing$.value - 1);
        },
        complete: () => this._parsing$.next(this._parsing$.value - 1),
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

          this._messageMap$.next({
            ...this._messageMap$.value,
            [`${this._objectName}.${this._messageName}`]: this._messages,
          });
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

    this._messageMap$.next(this._messageMap$.value);
  }
}
