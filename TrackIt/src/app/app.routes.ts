import { Routes, RouterModule } from '@angular/router';
import { KanbanComponent } from './components/kanban/kanban.component';
import { LoginComponent } from './components/login/login.component';
import { LostPassComponent } from './components/lost-pass/lost-pass.component';
import { PassChangeComponent } from './components/pass-change/pass-change.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { AdminComponent } from './components/admin/admin.component';
import { ProfileComponent } from './components/profile/profile.component';
import { NgModule } from '@angular/core';
import { AuthGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard'; // IMPORTÁLJUK AZ ADMIN GUARDOT
import { ChatComponent } from './components/chat/chat.component';

import { HaviPlannerComponent } from './components/havi-planner/havi-planner.component';
import { HaviPlannerKezeloComponent } from './components/havi-planner-kezelo/havi-planner-kezelo.component';
import { FeedComponent } from './components/feed/feed.component';
import { ChallengeComponent } from './components/challenge/challenge.component';
import { TrackerComponent } from './components/tracker/tracker.component';

export const routes: Routes = [
  {
    path: 'welcome',
    component: WelcomeComponent,
    canActivate: [AuthGuard],
    data: { label: 'Welcome', icon: '/assets/icons/badges_logo.png' }
  },
  {
    path: 'kanban',
    component: KanbanComponent,
    canActivate: [AuthGuard],
    data: { label: 'ToDo - Kanban', icon: '/assets/icons/todo_logo.png' }
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard, adminGuard],
    data: { label: 'Admin Panel', icon: '/assets/icons/admin_logo.png' }
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
    data: { label: 'Profile', icon: '/assets/icons/profile_logo.png' }
  },
  {
    path: 'chat',
    component: ChatComponent,
    canActivate: [AuthGuard],
    data: { label: 'Üzenetek', icon: '/assets/icons/messages_logo.png' }
  },
  {
    path: 'haviplanner',
    component: HaviPlannerComponent,
    canActivate: [AuthGuard],
    data: { label: 'Havi planner', icon: '/assets/icons/planner_logo.png' }
  },



  
  {
    path: 'feed',
    component: FeedComponent, // <-- Ezt adtuk hozzá
    canActivate: [AuthGuard], // Opcionális, ha bejelentkezés kell
    data: { label: 'Feed', icon: '/assets/icons/feed_logo.png' }
  },
  {
    path: 'challenge',
    component: ChallengeComponent,
    canActivate: [AuthGuard],
    data: { label: 'Kihívások', icon: '/assets/icons/challenge.png' }
  },
  {
    path: 'tracker', // <<< ÚJ TRACKER ROUTE
    component: TrackerComponent,
    canActivate: [AuthGuard],
    data: { label: 'Tracker', icon: '/assets/icons/track.png' } // Tetszés szerint módosítható
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