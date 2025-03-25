import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenName = environment.tokenName;
  private isLoggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$: Observable<boolean> = this.isLoggedIn.asObservable();
  private userSubject = new BehaviorSubject<any>(this.loggedUser());
  user$: Observable<any> = this.userSubject.asObservable();
  
  // Az admin státusz figyelése observable-ként
  private isAdminSubject = new BehaviorSubject<boolean>(this.isAdmin());
  isAdmin$: Observable<boolean> = this.isAdminSubject.asObservable();

  constructor() {}

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenName);
  }

  login(token: string) {
    localStorage.setItem(this.tokenName, token);
    this.isLoggedIn.next(true);
    this.userSubject.next(this.loggedUser());
    this.isAdminSubject.next(this.isAdmin()); // Admin státusz frissítése
  }

  logout() {
    localStorage.removeItem(this.tokenName);
    this.isLoggedIn.next(false);
    this.userSubject.next(null);
    this.isAdminSubject.next(false); // Admin státusz frissítése
  }

  loggedUser() {
    const token = localStorage.getItem(this.tokenName);
    if (token) {
      try {
        console.log('Token found:', token);
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload;
      } catch (error) {
        console.error("Hibás token formátum!", error);
        return null;
      }
    }
    console.log('No token found');
    return null;
  }

  isLoggedUser(): boolean {
    return this.hasToken();
  }

  isAdmin(): boolean {
    const payload = this.loggedUser();
    if (payload) {
      console.log('Role:', payload.role);
      return payload.role === 'admin';
    }
    return false;
  }
}
