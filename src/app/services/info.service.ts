import { Injectable } from '@angular/core';
import { combineLatest, ReplaySubject } from 'rxjs';
import { AssetService } from './asset.service';
import { SettingsService } from './settings.service';

/** Manager for special information files. */
@Injectable()
export class InfoService {
  /** Set to an error after files are loaded - or empty if anything is ok. */
  private readonly _parseDone$ = new ReplaySubject<string>(1);

  readonly parseDone$ = this._parseDone$.asObservable();

  /** Game introduction. */
  intro = '';

  /** Game over notification. */
  extro = '';

  /** Help information. */
  help = '';

  /**
   * Create a new service.
   *
   * @param _settings overall settings.
   * @param _assets file access helper.
   */
  constructor(
    private readonly _settings: SettingsService,
    private readonly _assets: AssetService
  ) {}

  /** Just load all files. */
  parse() {
    combineLatest([
      this._assets.download(`${this._settings.game}.INTRO`, true),
      this._assets.download(`${this._settings.game}.EXTRO`, true),
      this._assets.download(`${this._settings.game}.HELP`, true),
    ]).subscribe({
      next: ([intro, extro, help]) => {
        /** Introduction includes owner and serial number.   */
        this.intro = intro.replace('©', '999999').replace('®', 'Alle');
        this.extro = extro;
        this.help = help;

        /** Report no error. */
        this._parseDone$.next('');
      },
      error: (e) => this._parseDone$.next(e.message),
    });
  }
}
