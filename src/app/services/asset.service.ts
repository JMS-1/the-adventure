import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AssetService {
  constructor(private readonly _http: HttpClient) {}

  download(name: string) {
    return this._http
      .get(`data/${name}`, { responseType: 'text', withCredentials: true })
      .pipe(
        tap((s) => {
          if (s.startsWith('<')) throw new Error(`'${name}' not found`);
        })
      );
  }
}
