import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SidebarComponent } from './components/side-bar/side-bar.component';
import { filter } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router'; // Importáljuk a RouterModule-t

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, SidebarComponent, RouterModule], // Hozzáadjuk a RouterModule-t
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  isSidebarVisible: boolean = true;  // Alapértelmezett, hogy látszik a sidebar
  isSidebarCollapsed: boolean = false;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)  // Csak a NavigationEnd események érdekelnek
    ).subscribe((event: NavigationEnd) => {
      // Ahol nem akarjuk megjeleníteni a sidebart
      const noSidebarPaths = ['login', 'registration', 'welcome'];

      // Ha a jelenlegi URL megfelel a fenti útvonalaknak, akkor ne jelenjen meg a sidebar
      const hasNoSidebar = noSidebarPaths.some(path => event.urlAfterRedirects.includes(path));

      // A sidebar láthatóságát a fenti feltétel alapján állítjuk be
      this.isSidebarVisible = !hasNoSidebar;  // Ha igaz, akkor nem jelenik meg
    });
  }

  // Funkció a sidebar összecsukásához
  onSidebarToggle() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  title = 'TrackIt';
}
