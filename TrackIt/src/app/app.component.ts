import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { filter } from 'rxjs';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NewpostComponent } from './components/newpost/newpost.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, SidebarComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isSidebarCollapsed: boolean = false;  // Alapértelmezett, hogy a sidebar nem össze van csukva
  showSidebar: boolean = true;  // A változó, ami meghatározza, hogy látható-e a sidebar

  constructor(private router: Router) {}

  // Funkció a sidebar összecsukásához
  onSidebarToggle() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  ngOnInit() {
    // Figyeljük a navigációs eseményeket, és ennek megfelelően döntünk a sidebar megjelenítéséről
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const currentRoute = this.router.url;  // Az aktuális URL lekérése
      // Ha az aktuális oldal nem tartozik a megjelenítendő oldalak közé, elrejtjük a sidebar-t
      this.showSidebar = !['/login', '/registration', '/reset-password', '/lostpass', '/welcome'].includes(currentRoute);
    });
  }

  title = 'TrackIt';
}
