import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SettingsService } from './services/settings.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  providers: [SettingsService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(private readonly _settings: SettingsService) {}

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.testDeveloper);
  }

  ngOnInit(): void {
    document.addEventListener('keydown', this.testDeveloper);
  }

  private readonly testDeveloper = (ev: KeyboardEvent) => {
    if (ev.key !== 'F10') return;

    ev.preventDefault();

    this._settings.developer = true;
  };
}
