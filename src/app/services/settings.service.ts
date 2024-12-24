import { Injectable } from '@angular/core';

export type TGames = 'b5' | 'REV' | 'ROAR';

@Injectable()
export class SettingsService {
  readonly modernNames = true;

  readonly game: TGames = 'b5';
}
