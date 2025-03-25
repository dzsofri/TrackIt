import { CanActivateFn } from '@angular/router';

export const sidebarGuard: CanActivateFn = (route, state) => {
  return true; // Mindig true, mivel csak a sidebar láthatóságát irányítjuk
};
