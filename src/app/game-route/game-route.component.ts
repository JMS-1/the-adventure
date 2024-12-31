import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { CommandService } from '../commands/command.service';
import { AssetService } from '../services/asset.service';
import { DefaultsService } from '../services/defaults.service';
import { GameService } from '../services/game.service';
import { InfoService } from '../services/info.service';
import { MessagesService } from '../services/messages.service';
import { ObjectsService } from '../services/objects.service';
import { SettingsService } from '../services/settings.service';
import { StatesService } from '../services/states.service';

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
    CommandService,
  ],
  templateUrl: './game-route.component.html',
  styleUrl: './game-route.component.scss',
})
export class GameRouteComponent implements OnInit, OnDestroy {
  @ViewChild('game') private _output?: ElementRef;

  output = '';

  private readonly _outputSubscription: Subscription;

  constructor(
    public readonly settings: SettingsService,
    public readonly game: GameService
  ) {
    this._outputSubscription = game.output$.subscribe(([mode, text]) => {
      this.output += mode === 'debug' ? `[debug] ${text}\n` : `${text}\n`;

      setTimeout(() => {
        const output = this._output?.nativeElement as HTMLElement;

        if (output) output.scrollTop = output.scrollHeight;
      }, 0);
    });
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

  onEnter(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const command = input.value;

    input.value = '';

    if (command) this.game.run(command);
  }
}
