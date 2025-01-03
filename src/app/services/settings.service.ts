import { Injectable, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

export const games = {
  ROAR: 'Der Schrei des Monsters',
  REV: 'Die Rache des Monsters',
  b5: 'The Babylon project',
};

export type TGame = keyof typeof games;

const dosNames = new Set<TGame>(['ROAR', 'REV']);

const urlReg = /^\/([^/]+)?$/;

@Injectable()
export class SettingsService implements OnDestroy {
  debug = false;

  private readonly _idSubscription: Subscription;

  private _game?: TGame;

  constructor(private readonly _router: Router) {
    this._idSubscription = this._router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd)
        this._game = urlReg.exec(ev.url)?.[1] as TGame;
    });
  }

  ngOnDestroy(): void {
    this._idSubscription?.unsubscribe();
  }

  get game() {
    return this._game;
  }

  set game(game: TGame | undefined) {
    this._router.navigateByUrl(`/${game ?? ''}`);
  }

  get dosNames() {
    return this.game && dosNames.has(this.game);
  }
}
