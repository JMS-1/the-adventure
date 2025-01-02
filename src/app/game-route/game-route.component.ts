import { CommonModule } from '@angular/common';
import * as core from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
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

@core.Component({
  selector: 'app-game-route',
  imports: [CommonModule, MatButtonModule, MatSlideToggleModule, FormsModule],
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
export class GameRouteComponent implements core.AfterViewInit, core.OnDestroy {
  @core.ViewChild('game') private _output?: core.ElementRef;

  showDebug = true;

  private _outputSubscription?: Subscription;

  constructor(
    public readonly settings: SettingsService,
    public readonly game: GameService
  ) {}

  ngAfterViewInit(): void {
    const output = this._output?.nativeElement as HTMLElement;

    if (output)
      this._outputSubscription = this.game.output$.subscribe(([mode, text]) => {
        const div = document.createElement('div');

        div.innerText = `${text}`;
        div.classList.add(`output-${mode}`);

        output.appendChild(div);

        this.scrollToEnd();
      });

    this.game.parse();
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
    return set && Array.from(set);
  }

  onEnter(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const command = input.value;

    input.value = '';

    if (command) this.game.run(command);
  }

  scrollToEnd() {
    const output = this._output?.nativeElement as HTMLElement;

    if (output)
      setTimeout(
        () => output.scroll({ behavior: 'smooth', top: output.scrollHeight }),
        100
      );
  }

  clearOutput() {
    const output = this._output?.nativeElement as HTMLElement;

    if (output) output.innerText = '';
  }
}
