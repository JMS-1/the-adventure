import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-welcome-route',
  imports: [RouterModule, MatButtonModule],
  templateUrl: './welcome-route.component.html',
  styleUrl: './welcome-route.component.scss',
})
export class WelcomeRouteComponent {}
