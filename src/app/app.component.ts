import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { GameSelectorComponent } from './game-selector/game-selector.component';
import { MessagesService } from './services/messages.service';
import { SettingsService } from './services/settings.service';

@Component({
  selector: 'app-root',
  imports: [
    AsyncPipe,
    GameSelectorComponent,
    JsonPipe,
    MatButtonModule,
    RouterOutlet,
  ],
  providers: [SettingsService, MessagesService, GameSelectorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  constructor(public readonly messages: MessagesService) {}

  parseMessages() {
    this.messages.parse();
  }
}
