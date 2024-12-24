import { Injectable } from '@angular/core';

@Injectable()
export class SettingsService {
  readonly modernNames = true;

  readonly game = 'b5';
}
