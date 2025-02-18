import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WelcomeComponent } from '../components/welcome/welcome.component';
import { CommonModule } from '@angular/common';
import { RegistrationComponent } from '../components/registration/registration.component';
import { SideBarComponent } from '../components/side-bar/side-bar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, SideBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'TrackIt';

  isSidebarOpen = false; // Kezdetben zárt

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
