// app-routing.module.ts
import { Routes, RouterModule } from '@angular/router';
import { KanbanComponent } from './components/kanban/kanban.component';
import { LoginComponent } from './components/login/login.component';
import { LostPassComponent } from './components/lost-pass/lost-pass.component';
import { PassChangeComponent } from './components/pass-change/pass-change.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { AdminComponent } from './components/admin/admin.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NgModule } from '@angular/core';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: 'welcome', 
    component: WelcomeComponent,
    canActivate: [AuthGuard],
    data: { label: 'Welcome', icon: 'fas fa-home' }
  },
  { 
    path: 'kanban', 
    component: KanbanComponent, 
    canActivate: [AuthGuard],
    data: { label: 'Kanban', icon: 'fas fa-tasks' }
  },
  { 
    path: 'admin', 
    component: AdminComponent, 
    canActivate: [AuthGuard],
    data: { label: 'Admin Panel', icon: 'fas fa-user-shield' }
  },
  { 
    path: 'login', 
    component: LoginComponent, 
   
  },
  { 
    path: 'registration', 
    component: RegistrationComponent, 
   
  },
  { 
    path: 'lostpass', 
    component: LostPassComponent,
    
  },
  { 
    path: 'reset-password', 
    component: PassChangeComponent,
   
  },
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [AuthGuard],
    data: { label: 'Profile', icon: 'fas fa-user' }
  },
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
