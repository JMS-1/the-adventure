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
import { RoomsService } from '../services/rooms.service';
import { SettingsService } from '../services/settings.service';

/** Represents a single active game - especially provides all per-game service instances. */
@core.Component({
  selector: 'app-game-route',
  imports: [CommonModule, FormsModule, MatButtonModule, MatSlideToggleModule],
  providers: [
    AssetService,
    CommandService,
    DefaultsService,
    GameService,
    InfoService,
    MessagesService,
    ObjectsService,
    RoomsService,
  ],
  templateUrl: './game-route.component.html',
  styleUrl: './game-route.component.scss',
})
export class GameRouteComponent implements core.AfterViewInit, core.OnDestroy {
  /** DOM element to show all game output. */
  @core.ViewChild('output') private _output?: core.ElementRef;

  /** DOM element with the command input. */
  @core.ViewChild('input') private _input?: core.ElementRef;

  /** Subscription to the game output. */
  private _outputSubscription?: Subscription;

  /**
   * Create a new active game visualisation.
   *
   * @param settings overall settings.
   * @param game active game.
   */
  constructor(
    public readonly settings: SettingsService,
    public readonly game: GameService
  ) {}

  ngAfterViewInit(): void {
    /** Just make sure template is valid. */
    const output = this._output?.nativeElement as HTMLElement;

    if (output)
      /** Watch out for all output fromn the game - regular, debug, error or verbatim information file. */
      this._outputSubscription = this.game.output$.subscribe(([mode, text]) => {
        /** Each output will get its own DIV element with an appropriate CSS class attached. */
        const div = document.createElement('div');

        div.innerText = `${text}`;
        div.classList.add(`output-${mode}`);

        output.appendChild(div);

        /** Make sure latest output is visible. */
        this.scrollToEnd();
      });

    /** Parse the game definition and start the game. */
    this.game.parse();
  }

  ngOnDestroy(): void {
    this._outputSubscription?.unsubscribe();
  }

  /**
   * Report all keys of a map (debug only).
   *
   * @param map some map.
   * @returns all keys in the map as an array.
   */
  mapKeys<T>(map: Record<string, T>) {
    return Object.keys(map);
  }

  /**
   * Report all values of a set (debug only)
   *
   * @param set a set of any type.
   * @returns array of all values in the set.
   */
  setValues<T>(set: Set<T>) {
    return set && Array.from(set);
  }

  /**
   * Process user input.
   *
   * @param ev information on what the user typed.
   */
  onEnter(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const command = input.value;

    /** Reset command input. */
    input.value = '';

    /** Process input and advance in the game. */
    this.game.run(command);
  }

  /** Scroll the output display to the very end. */
  scrollToEnd() {
    const output = this._output?.nativeElement as HTMLElement;

    if (output)
      setTimeout(
        () => output.scroll({ behavior: 'smooth', top: output.scrollHeight }),
        100
      );
  }

  /** Wipe out all output from the game. */
  clearOutput() {
    const output = this._output?.nativeElement as HTMLElement;

    if (output) output.innerText = '';
  }

  /** Save the current game set. */
  save() {
    this.game.save();

    this.focusToInput();
  }

  /** Try to reload the game state from the local storage of the browser. */
  load() {
    /** See if state can be reconstructed. */
    if (!this.game.load()) return;

    /** Wipe out all output. */
    this.clearOutput();

    /** Visualize the state. */
    this.game.dumpCurrentRoom();
    this.game.dumpInventory();

    this.focusToInput();
  }

  /** Set focus to input. */
  private focusToInput() {
    setTimeout(() => this._input?.nativeElement.focus(), 100);
  }
}
