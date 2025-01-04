import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { SettingsService } from './settings.service';

/** Helper to download definition files. */
@Injectable()
export class AssetService {
  /**
   * Create a new helper.
   *
   * @param _http HTTP access client.
   * @param _settings overall configuration.
   */
  constructor(
    private readonly _http: HttpClient,
    private readonly _settings: SettingsService
  ) {}

  /**
   * Download a single file.
   *
   * @param name name of the file.
   * @param explicit use name of the file as is and do not try to
   * dumb it down to the legacy DOS notation.
   */
  download(name: string, explicit = false) {
    /** Older games use 8.3 DOS file name notation - in uppercase. */
    if (this._settings.dosNames && !explicit) {
      const split = name.split('.');

      name = `${split[0]}.${split[1].substring(0, 3)}`.toUpperCase();
    }

    /** Download raw text file. */
    return this._http
      .get(`data/${name}`, { responseType: 'text', withCredentials: true })
      .pipe(
        tap((s) => {
          /** Coarse test for bad content. */
          if (s.startsWith('<')) throw new Error(`'${name}' not found`);
        })
      );
  }
}
