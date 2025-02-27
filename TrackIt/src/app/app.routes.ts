import { Routes } from '@angular/router';
import { KanbanComponent } from '../components/kanban/kanban.component';
import { WelcomeComponent } from '../components/welcome/welcome.component';
import { LoginComponent } from '../components/login/login.component';
import { RegistrationComponent } from '../components/registration/registration.component';
import { LostPassComponent } from '../components/lost-pass/lost-pass.component';
import { PassChangeComponent } from '../components/pass-change/pass-change.component';

export const routes: Routes = [
  { path: 'welcome', component: WelcomeComponent, data: { animation: 'WelcomePage' } },
  { path: 'kanban', component: KanbanComponent, data: { animation: 'KanbanPage' } },
  { path: 'login', component: LoginComponent },
  { path: 'registration', component: RegistrationComponent },
  { path: 'lostpass', component: LostPassComponent },
  { path: 'reset-password', component: PassChangeComponent },
  {path: '', redirectTo: 'login', pathMatch: 'full'},
];
