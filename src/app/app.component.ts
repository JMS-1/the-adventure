import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessagesService } from './services/messages.service';
import { SettingsService } from './services/settings.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatButtonModule],
  providers: [SettingsService, MessagesService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  constructor(public messages: MessagesService) {}
}
