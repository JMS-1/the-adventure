import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-load-selector',
  imports: [MatDialogModule, MatButtonModule, CommonModule],
  templateUrl: './load-selector.component.html',
  styleUrl: './load-selector.component.scss',
})
export class LoadSelectorComponent {
  readonly all;

  constructor(game: GameService) {
    this.all = game.currentSavedStates;
  }
}
