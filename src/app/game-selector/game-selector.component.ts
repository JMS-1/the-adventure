import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { games, SettingsService, TGame } from '../services/settings.service';

@Component({
  selector: 'app-game-selector',
  imports: [MatSelectModule, NgFor, MatFormFieldModule],
  templateUrl: './game-selector.component.html',
  styleUrl: './game-selector.component.scss',
})
export class GameSelectorComponent {
  readonly games = Object.keys(games) as TGame[];

  getGameName(game: TGame) {
    return games[game] || game;
  }

  constructor(public readonly settings: SettingsService) {}
}
