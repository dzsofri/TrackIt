import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { routes } from '../../app.routes';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
export class SidebarComponent {
  @Input() isSidebarCollapsed = false;
  @Output() sidebarToggle = new EventEmitter<void>();

  menuItems: MenuItem[] = [];
  isAdmin = false;
  lastActiveMenuItem: MenuItem | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadMenuItems();
    this.isAdmin = this.authService.isAdmin();
    this.router.events.subscribe(() => {
      this.checkAdminRoute();
    });
  }

  loadMenuItems() {
    this.menuItems = this.generateMenuItemsFromRoutes(routes);
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
      }));
  }

  setActiveMenuItem(item: MenuItem) {
    if (!this.isSidebarCollapsed) {
      this.menuItems.forEach(menu => menu.isActive = false);
      item.isActive = true;
      this.lastActiveMenuItem = item;
    }
  }

  toggleSidebar() {
    this.sidebarToggle.emit();
    if (this.isSidebarCollapsed) {
      if (this.lastActiveMenuItem) {
        this.lastActiveMenuItem.isActive = true;
      }
    } else {
      this.menuItems.forEach(menu => menu.isActive = false);
    }
  }

  checkAdminRoute() {
    const currentRoute = this.router.url;
    const isAdminRoute = currentRoute.includes('/admin');
    if (isAdminRoute) {
      this.menuItems.forEach(item => {
        if (item.route === '/admin') {
          item.isActive = true;
        }
      });
    }
  }

  toggleChildMenuItem(item: MenuItem) {
    if (item.children && !this.isSidebarCollapsed) {
      item.isOpen = !item.isOpen;
    }
  }
}
