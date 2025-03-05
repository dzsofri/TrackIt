import { Routes } from '@angular/router';
import { KanbanComponent } from './components/kanban/kanban.component';
import { LoginComponent } from './components/login/login.component';
import { LostPassComponent } from './components/lost-pass/lost-pass.component';
import { PassChangeComponent } from './components/pass-change/pass-change.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { AdminComponent } from './components/admin/admin.component';

export const routes: Routes = [
  { path: 'welcome', component: WelcomeComponent,canActivate: [authGuard], data: { animation: 'WelcomePage' } },
  { path: 'kanban', component: KanbanComponent, canActivate: [authGuard], data: { animation: 'KanbanPage' } }, // Csak bejelentkezett felhasználóknak
  { path: 'admin', component: AdminComponent}, // Csak bejelentkezett felhasználóknak
 


  { path: 'login', component: LoginComponent },
  { path: 'registration', component: RegistrationComponent },
  { path: 'lostpass', component: LostPassComponent },
  { path: 'reset-password', component: PassChangeComponent },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
