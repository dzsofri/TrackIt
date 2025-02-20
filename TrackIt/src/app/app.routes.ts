import { Routes } from '@angular/router';
import { KanbanComponent } from '../components/kanban/kanban.component';
import { WelcomeComponent } from '../components/welcome/welcome.component';

export const routes: Routes = [
  { path: 'welcome', component: WelcomeComponent, data: { animation: 'WelcomePage' } },
  { path: 'kanban', component: KanbanComponent, data: { animation: 'KanbanPage' } },

  {
    path: '', redirectTo: 'welcome', pathMatch: 'full'
  },
];
