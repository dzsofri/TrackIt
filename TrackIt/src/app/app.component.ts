import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WelcomeComponent } from '../components/welcome/welcome.component';
import { CommonModule } from '@angular/common';
import { RegistrationComponent } from '../components/registration/registration.component';
import { ProfileComponent } from '../components/profile/profile.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, WelcomeComponent, CommonModule, RegistrationComponent, ProfileComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'TrackIt';
}
