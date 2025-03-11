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

getAllUsers(): Observable<{ users: User[], message: string }> {
    return this.http.get<{ users: User[], message: string }>(this.server + '/users', this.tokenHeader()).pipe(
      catchError(error => {
        console.error('Error fetching users:', error);
        return of({ users: [], message: 'Error occurred while fetching users' });  // Return a fallback response
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

getUsers(): Observable<{ users: User[], count: number, message?: string }> {
  return this.http.get<{ users: User[], count: number, message?: string }>(
    `${this.server}/users`, 
    this.tokenHeader()
  ).pipe(
    catchError(error => {
      console.error('Error fetching users:', error);
      return of({ users: [], count: 0, message: 'Error occurred while fetching users' });
    })
  );
}

getChallenges(): Observable<{ challenges: any[], count: number, message?: string }> {
  return this.http.get<{ challenges: any[], count: number, message?: string }>(
    `${this.server}/challenges`, 
    this.tokenHeader()
  ).pipe(
    catchError(error => {
      console.error('Error fetching challenges:', error);
      return of({ challenges: [], count: 0, message: 'Error occurred while fetching challenges' });
    })
  );
}

getPosts(): Observable<{ posts: any[], count: number, message?: string }> {
  return this.http.get<{ posts: any[], count: number, message?: string }>(
    `${this.server}/posts`, 
    this.tokenHeader()
  ).pipe(
    catchError(error => {
      console.error('Error fetching posts:', error);
      return of({ posts: [], count: 0, message: 'Error occurred while fetching posts' });
    })
  );
}

getFeedbacks(): Observable<{ posts: any[], message?: string }> {
  return this.http.get<{ posts: any[], message?: string }>(
    `${this.server}/feedbacks`, 
    this.tokenHeader()
  ).pipe(
    catchError(error => {
      console.error('Error fetching posts:', error);
      return of({ posts: [], count: 0, message: 'Error occurred while fetching posts' });
    })
  );
}

read_Stat(table: string, field: string, op: string, value: string) {
    return this.http.get(`${this.server}/public/${table}/${field}/${op}/${value}`);
}

}
