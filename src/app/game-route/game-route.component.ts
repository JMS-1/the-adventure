import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AssetService } from '../services/asset.service';
import { DefaultsService } from '../services/defaults.service';
import { GameService } from '../services/game.service';
import { InfoService } from '../services/info.service';
import { MessagesService } from '../services/messages.service';
import { ObjectsService } from '../services/objects.service';
import { SettingsService } from '../services/settings.service';
import { StatesService } from '../services/states.service';
import { WordsService } from '../services/words.service';

@Component({
  selector: 'app-game-route',
  imports: [CommonModule],
  providers: [
    AssetService,
    DefaultsService,
    GameService,
    InfoService,
    MessagesService,
    ObjectsService,
    StatesService,
    WordsService,
  ],
  templateUrl: './game-route.component.html',
  styleUrl: './game-route.component.scss',
})
export class GameRouteComponent implements OnInit, OnDestroy {
  output = '';

  private readonly _outputSubscription: Subscription;

  constructor(
    public readonly settings: SettingsService,
    public readonly game: GameService
  ) {
    this._outputSubscription = game.output$.subscribe(
      (o) => (this.output += `${o}\n`)
    );
  }

  ngOnDestroy(): void {
    this._outputSubscription?.unsubscribe();
  }

  countMap<T>(map: Record<string, T>) {
    return this.mapKeys(map).length;
  }

  mapKeys<T>(map: Record<string, T>) {
    return Object.keys(map);
  }

  setValues<T>(set: Set<T>) {
    return Array.from(set);
  }

  ngOnInit(): void {
    this.game.parse();
  }
}
