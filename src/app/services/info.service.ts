import { Injectable } from '@angular/core';
import { combineLatest, ReplaySubject } from 'rxjs';
import { AssetService } from './asset.service';
import { SettingsService } from './settings.service';

@Injectable()
export class InfoService {
  private readonly _parseDone$ = new ReplaySubject<string>(1);

  readonly parseDone$ = this._parseDone$.asObservable();

  intro = '';

  extro = '';

  help = '';

  constructor(
    private readonly _settings: SettingsService,
    private readonly _assets: AssetService
  ) {}

  parse() {
    combineLatest([
      this._assets.download(`${this._settings.game}.INTRO`, true),
      this._assets.download(`${this._settings.game}.EXTRO`, true),
      this._assets.download(`${this._settings.game}.HELP`, true),
    ]).subscribe({
      next: ([intro, extro, help]) => {
        this.intro = intro.replace('©', '999999').replace('®', 'Alle');
        this.extro = extro;
        this.help = help;

        this._parseDone$.next('');
      },
      error: (e) => this._parseDone$.next(e.message),
    });
  }
}
