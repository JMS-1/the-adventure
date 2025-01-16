import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { games, TGame } from '../services/settings.service';

/** Initial display of the game application - mostly to choose a game to play. */
@Component({
  selector: 'app-welcome-route',
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterModule],
  templateUrl: './welcome-route.component.html',
  styleUrl: './welcome-route.component.scss',
})
export class WelcomeRouteComponent {
  /** Name of all games. */
  readonly names = games;

  /** List of all games. */
  readonly games = Object.keys(games) as TGame[];
}
