import { AsyncPipe, JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { GameSelectorComponent } from './game-selector/game-selector.component';
import { MessagesService } from './services/messages.service';
import { ObjectsService } from './services/objects.service';
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
  providers: [MessagesService, ObjectsService, WordsService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  constructor(
    public readonly messages: MessagesService,
    public readonly words: WordsService,
    public readonly objects: ObjectsService
  ) {}
}
