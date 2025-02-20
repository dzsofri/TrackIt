import { Routes } from '@angular/router';
import { KanbanComponent } from '../components/kanban/kanban.component';
import { WelcomeComponent } from '../components/welcome/welcome.component';
import { LoginComponent } from '../components/login/login.component';
import { RegistrationComponent } from '../components/registration/registration.component';

export const routes: Routes = [
  { path: 'welcome', component: WelcomeComponent, data: { animation: 'WelcomePage' } },
  { path: 'kanban', component: KanbanComponent, data: { animation: 'KanbanPage' } },
  { path: 'login', component: LoginComponent },
  { path: 'registartion', component: RegistrationComponent },
  {
    path: '', redirectTo: 'login', pathMatch: 'full' // Redirect to login when the path is empty
  },
];
