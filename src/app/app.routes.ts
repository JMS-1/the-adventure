import { Routes } from '@angular/router';
import { GameRouteComponent } from './game-route/game-route.component';
import { WelcomeRouteComponent } from './welcome-route/welcome-route.component';

export const routes: Routes = [
  {
    path: 'ROAR',
    component: GameRouteComponent,
  },
  {
    path: 'REV',
    component: GameRouteComponent,
  },
  {
    path: 'b5',
    component: GameRouteComponent,
  },
  {
    path: '**',
    component: WelcomeRouteComponent,
  },
];
