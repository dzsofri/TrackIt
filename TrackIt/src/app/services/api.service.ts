import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { catchError, Observable, of } from 'rxjs';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})

export class ApiService {

  constructor(private http: HttpClient) { }

  private tokenName = environment.tokenName;
  private server = environment.serverUrl;

  getToken():String | null{
    return localStorage.getItem(this.tokenName);
  }

  tokenHeader():{ headers: HttpHeaders }{
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return { headers }
  }

  registration(data:object){
    return this.http.post(this.server + '/users/register', data);
  }


  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.server}/users/login`, { email, password }).pipe(
      catchError(error => {
        console.error('Login failed', error);
        return of(error);
      })
    );
  }
  
  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.server}/users/forgot-password`, { email }).pipe(
      catchError(error => {
        console.error('Forgot password failed', error);
        return of(error);
      })
    );
  }


  

  resetPassword(email: string, token: string, newPassword: any): Observable<any> {
    return this.http.post<any>(`${this.server}/users/reset-password`, { email, token, newPassword }).pipe(
        catchError(error => {
            console.error('Jelszócsere sikertelen', error);
            return of(error);
        })
    );
}

  readUserStatistics(table: string, userId: string): Observable<any> {
    return this.http.get(`${this.server}/${table}/statistics/${userId}`, this.tokenHeader());
  }

  readUserHabits(table: string, userId: string): Observable<any> {
    return this.http.get(`${this.server}/${table}/habit/${userId}`, this.tokenHeader());
  }

  readUserChallenges(table: string, userId: string): Observable<any> {
    return this.http.get(`${this.server}/${table}/challenges/${userId}`, this.tokenHeader());
  }

  readFriendRequests(table: string, userId: string): Observable<any> {
    return this.http.get(`${this.server}/${table}/friendrequests/${userId}`, this.tokenHeader());
  }

  getUser(userId: string): Observable<User> {
    return this.http.get<User>(`${this.server}/users/${userId}`, this.tokenHeader());
  }
}
