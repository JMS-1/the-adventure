import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { GameSelectorComponent } from './game-selector/game-selector.component';
import { AssetService } from './services/asset.service';
import { MessagesService } from './services/messages.service';
import { ObjectsService } from './services/objects.service';
import { SettingsService } from './services/settings.service';
import { StatesService } from './services/states.service';
import { WordsService } from './services/words.service';

@Component({
  selector: 'app-root',
  imports: [
    AsyncPipe,
    GameSelectorComponent,
    JsonPipe,
    MatButtonModule,
    RouterOutlet,
  ],
  providers: [
    AssetService,
    MessagesService,
    ObjectsService,
    SettingsService,
    StatesService,
    WordsService,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  constructor(
    public readonly messages: MessagesService,
    public readonly words: WordsService,
    public readonly objects: ObjectsService,
    public readonly states: StatesService
  ) {}
}
