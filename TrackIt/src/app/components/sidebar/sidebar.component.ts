import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from '../../app.routes';
import { CommonModule } from '@angular/common';


interface MenuItem {
  label: string;
  icon: string;
  route: string;
  isOpen?: boolean;
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [CommonModule]
})
export class SidebarComponent {
  @Input() isSidebarCollapsed = false;
  @Output() sidebarToggle = new EventEmitter<void>();

  menuItems: MenuItem[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadMenuItems();
    console.log('Betöltött menü elemek:', this.menuItems);
  }

  // Az útvonalakból generáljuk a menüelemeket
  loadMenuItems() {
    this.menuItems = this.generateMenuItemsFromRoutes(routes);
    console.log('Generált menü elemek:', this.menuItems); // Nézd meg, hogy az útvonalak helyesen kerülnek-e be
  }
  

  // Az útvonalakból létrehozzuk a menüelemeket
  generateMenuItemsFromRoutes(routes: any[]): MenuItem[] {
    return routes
      .filter(route => route.data) // Csak azok az útvonalak, amiknek van data
      .map(route => ({
        label: route.data?.label || '', 
        icon: route.data?.icon || '',  
        route: route.path,           
        children: route.children || [], 
      }));
  }

  toggleSidebar() {
    this.sidebarToggle.emit();
  }
  navigateTo(route: string) {
    console.log('Navigálás előtt', route);  
    this.router.navigate([route]).then(() => {
      console.log('Navigáltunk ide:', route); 
    }).catch((err) => {
      console.error('Hiba a navigáció során:', err); 
    });
  }
  
  
  

  toggleMenuItem(item: MenuItem) {
    if (item.children && !this.isSidebarCollapsed) {
      item.isOpen = !item.isOpen;
    }
  }
}
