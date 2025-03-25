import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { routes } from '../../app.routes';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  isOpen?: boolean;
  isActive?: boolean;
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [CommonModule, RouterModule]
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() isSidebarCollapsed = false;
  @Output() sidebarToggle = new EventEmitter<void>();

  menuItems: MenuItem[] = [];
  isAdmin = false;
  lastActiveMenuItem: MenuItem | null = null;

  private adminStatusSubscription: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadMenuItems();

    // Admin státusz figyelése
    this.adminStatusSubscription = this.authService.isAdmin$.subscribe(isAdmin => {
      this.isAdmin = isAdmin;
      this.loadMenuItems(); // Ha változik az admin státusz, újratöltjük a menüt
    });

    // Route változás figyelése
    this.router.events.subscribe(() => {
      this.checkAdminRoute();
    });
  }

  ngOnDestroy() {
    // Leiratkozunk a subscription-ről
    if (this.adminStatusSubscription) {
      this.adminStatusSubscription.unsubscribe();
    }
  }

  loadMenuItems() {
    this.menuItems = this.generateMenuItemsFromRoutes(routes);
    this.setActiveMenuItemBasedOnRoute(); // Beállítjuk az aktív menüpontot az aktuális route alapján
  }

  generateMenuItemsFromRoutes(routes: any[]): MenuItem[] {
    return routes
      .filter(route => route.data)
      .map(route => ({
        label: route.data?.label || '',
        icon: route.data?.icon || '',
        route: route.path,
        children: route.children || [],
        isActive: false,
      }))
      .filter(item => this.isAdmin || item.route !== '/admin'); // Csak admin esetén jelenítjük meg az admin menüpontot
  }

  setActiveMenuItem(item: MenuItem) {
    if (!this.isSidebarCollapsed) {
      this.menuItems.forEach(menu => menu.isActive = false); // Minden menüpontot inaktívra állítunk
      item.isActive = true; // Beállítjuk az aktuális menüpontot aktívra
      this.lastActiveMenuItem = item; // Elmentjük az utolsó aktív menüpontot
    }
  }

  toggleSidebar() {
    this.sidebarToggle.emit();
    if (this.isSidebarCollapsed) {
      // Ha a sidebar össze van csukva, akkor az utolsó aktív menüpontot újra aktívvá tesszük
      if (this.lastActiveMenuItem) {
        this.lastActiveMenuItem.isActive = true;
      }
    } else {
      // Ha a sidebar nyitva van, akkor minden menüpontot inaktívvá teszünk
      this.menuItems.forEach(menu => menu.isActive = false);
    }
  }

  checkAdminRoute() {
    const currentRoute = this.router.url;
    const isAdminRoute = currentRoute.includes('/admin');

    // Ha admin oldalon vagyunk, akkor az admin menüpontot aktívvá tesszük
    if (isAdminRoute) {
      this.menuItems.forEach(item => {
        if (item.route === '/admin') {
          item.isActive = true;
        }
      });
    }
  }

  setActiveMenuItemBasedOnRoute() {
    const currentRoute = this.router.url;
    this.menuItems.forEach(item => {
      item.isActive = item.route === currentRoute; // Beállítjuk az aktív menüpontot az aktuális route alapján
    });
  }

  toggleChildMenuItem(item: MenuItem) {
    if (item.children && !this.isSidebarCollapsed) {
      item.isOpen = !item.isOpen;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
