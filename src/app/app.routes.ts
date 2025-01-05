import { Routes } from '@angular/router';
import { GameRouteComponent } from './game-route/game-route.component';
import { games } from './services/settings.service';
import { WelcomeRouteComponent } from './welcome-route/welcome-route.component';

/** Use explicit routing between games - using :game paramtrized do not work as expected. */
export const routes: Routes = [
  ...Object.keys(games).map((game) => ({
    path: game,
    component: GameRouteComponent,
  })),
  {
    path: '**',
    component: WelcomeRouteComponent,
  },
];
