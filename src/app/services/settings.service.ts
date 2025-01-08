import { Injectable, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

/** All games currently supported. */
export const games = {
  ROAR: 'Der Schrei des Monsters (deutsch)',
  REV: 'Die Rache des Monsters (deutsch)',
  b5: 'The Babylon project (english)',
};

export type TGame = keyof typeof games;

/** Games using DOS 8.3 file name notation. */
const dosNames = new Set<TGame>(['ROAR', 'REV']);

/** [ '/' ] <game> */
const urlReg = /^\/([^/]+)?$/;

/** Key of this application in the local storage. */
const storageDeveloper = 'W3ADV.Settings.Developer';

/** Provide overall settings. */
@Injectable()
export class SettingsService implements OnDestroy {
  /** Set to show debug information. */
  debug = false;

  /** Set to switch to developer mode. */
  get developer() {
    return !!localStorage.getItem(storageDeveloper);
  }

  set developer(developer: boolean) {
    localStorage.setItem(storageDeveloper, developer ? 'yes' : '');
  }

  /** Subscription to detect game selection using routes. */
  private readonly _idSubscription: Subscription;

  /** The active game - may be none as well. */
  private _game?: TGame;

  /**
   * Create settings.
   *
   * @param _router router service.
   */
  constructor(private readonly _router: Router) {
    /** Register for switch to developer mode. */
    document.addEventListener('keydown', this.testDeveloper);

    /** Detect game selection using route change detection. */
    this._idSubscription = this._router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd)
        this._game = urlReg.exec(ev.url)?.[1] as TGame;
    });
  }

  ngOnDestroy(): void {
    /** Should unregister from DOM event. */
    document.removeEventListener('keydown', this.testDeveloper);

    this._idSubscription?.unsubscribe();
  }

  /**
   * Switch to developer mode if F10 is pressed.
   *
   * @param ev key typed by the user.
   */
  private readonly testDeveloper = (ev: KeyboardEvent) => {
    if (ev.key !== 'F10') return;

    ev.preventDefault();

    this.developer = !this.developer;
  };

  /** Current game running. */
  get game() {
    return this._game;
  }

  set game(game: TGame | undefined) {
    /** Switch games using routes. */
    this._router.navigateByUrl(`/${game ?? ''}`);
  }

  /** Report if the current game uses 8.3 DOS notation for file names. */
  get dosNames() {
    return this.game && dosNames.has(this.game);
  }
}
