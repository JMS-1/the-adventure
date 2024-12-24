import { Injectable } from '@angular/core';

export const games = {
  ROAR: 'Der Schrei des Monsters',
  REV: 'Die Rache des Monsters',
  b5: 'The Babylon project',
};

export type TGame = keyof typeof games;

const modernNames = new Set<TGame>(['b5']);

@Injectable()
export class SettingsService {
  game: TGame = 'b5';

  get modernNames() {
    return modernNames.has(this.game);
  }
}
