import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';  
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    console.log('AuthGuard - CanActivate');

    const isLoggedIn = this.auth.isLoggedUser();
    console.log('Is logged in:', isLoggedIn);

    if (isLoggedIn) {
      console.log('User is logged in');
      return of(true); 
    } else {
      console.log('User is not logged in');
      this.router.navigate(['/login']);  
      return of(false);
    }
  }
}
