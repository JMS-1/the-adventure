import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameSelectorComponent } from './game-selector/game-selector.component';
import { SettingsService } from './services/settings.service';

@Component({
  selector: 'app-root',
  imports: [GameSelectorComponent, RouterOutlet],
  providers: [SettingsService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
