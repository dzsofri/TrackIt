import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { filter } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router'; // Importáljuk a RouterModule-t
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, SidebarComponent, RouterModule], // Hozzáadjuk a RouterModule-t
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  isSidebarCollapsed: boolean = false;  // Alapértelmezett, hogy a sidebar nem össze van csukva

  // Funkció a sidebar összecsukásához
  onSidebarToggle() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
  title = 'TrackIt';
}
