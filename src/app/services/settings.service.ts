import { Injectable } from '@angular/core';

export const games = {
  ROAR: 'Der Schrei des Monsters',
  REV: 'Die Rache des Monsters',
  b5: 'The Babylon project',
};

export type TGame = keyof typeof games;

const dosNames = new Set<TGame>(['ROAR', 'REV']);

@Injectable()
export class SettingsService {
  game: TGame = 'b5';

  get dosNames() {
    return dosNames.has(this.game);
  }
}
