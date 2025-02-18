import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WelcomeComponent } from '../components/welcome/welcome.component';
import { CommonModule } from '@angular/common';
import { RegistrationComponent } from '../components/registration/registration.component';
import { KanbanComponent } from "../components/kanban/kanban.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, WelcomeComponent, CommonModule, RegistrationComponent, KanbanComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'TrackIt';
}
