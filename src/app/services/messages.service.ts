import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';

@Injectable()
export class MessagesService {
  parsing = false;

  lastError = '';

  constructor(
    private readonly _settings: SettingsService,
    private readonly _http: HttpClient
  ) {}

  parse() {
    this.parsing = true;
    this.lastError = '';

    this._http
      .get(
        `data/${this._settings.game}.${
          this._settings.modernNames ? 'msg' : 'MSG'
        }`,
        { responseType: 'text', withCredentials: true }
      )
      .subscribe({
        next: (s) => this.parseRoot(s.replace(/\r/g, '').split('\n')),
        error: (e) => (this.lastError = e.message),
        complete: () => (this.parsing = false),
      });
  }

  private parseRoot(lines: string[]) {
    this.lastError = `${lines.length}`;
  }
}
