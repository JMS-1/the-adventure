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

    this.processFile(
      `${this._settings.game}.${this._settings.modernNames ? 'msg' : 'MSG'}`
    );
  }

  private processFile(name: string) {
    this._http
      .get(`data/${name}`, { responseType: 'text', withCredentials: true })
      .subscribe({
        next: (s) => this.parseFile(s.replace(/\r/g, '').split('\n')),
        error: (e) => (this.lastError = e.message),
        complete: () => (this.parsing = false),
      });
  }

  private parseFile(lines: string[]) {
    for (const line of lines) {
      if (line.startsWith('$$$')) this.processFile(line.substring(3));
      else console.log(line);
    }
  }
}
