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

  constructor() {  }
 
  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenName)
  }

  login(token: string) {
    localStorage.setItem(this.tokenName, token);
    this.isLoggedIn.next(true);
    this.userSubject.next(this.loggedUser());
  }

  logout() {
    localStorage.removeItem(this.tokenName);
    this.isLoggedIn.next(false);
    this.userSubject.next(null);
  }

  loggedUser() {
    const token = localStorage.getItem(this.tokenName);
    if (token) {
      try {
        console.log('Token found:', token);
        return JSON.parse(atob(token.split('.')[1])); 
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
    return this.loggedUser()?.role === 'admin';
  }
}
