import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { games, TGame } from '../services/settings.service';

@Component({
  selector: 'app-welcome-route',
  imports: [RouterModule, MatButtonModule, CommonModule],
  templateUrl: './welcome-route.component.html',
  styleUrl: './welcome-route.component.scss',
})
export class WelcomeRouteComponent {
  readonly names = games;

  readonly games = Object.keys(games) as TGame[];
}
