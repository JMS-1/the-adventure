import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SettingsService } from './services/settings.service';

/** Just provide the router outlet and the overall settings service. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  providers: [SettingsService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
