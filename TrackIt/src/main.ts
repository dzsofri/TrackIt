import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { KanbanComponent } from './components/kanban/kanban.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      { path: '', component: WelcomeComponent, data: { animation: 'WelcomePage' } },
      { path: 'kanban', component: KanbanComponent, data: { animation: 'KanbanPage' } }
    ]),
    provideAnimations() // 🔹 Animációk engedélyezése
  ]
}).catch(err => console.error(err));
