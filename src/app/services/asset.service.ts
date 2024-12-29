import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { SettingsService } from './settings.service';

@Injectable()
export class AssetService {
  constructor(
    private readonly _http: HttpClient,
    private readonly _settings: SettingsService
  ) {}

  download(name: string, explicit = false) {
    if (this._settings.dosNames && !explicit) {
      const split = name.split('.');

      name = `${split[0]}.${split[1].substring(0, 3)}`.toUpperCase();
    }

    return this._http
      .get(`data/${name}`, { responseType: 'text', withCredentials: true })
      .pipe(
        tap((s) => {
          if (s.startsWith('<')) throw new Error(`'${name}' not found`);
        })
      );
  }
}
