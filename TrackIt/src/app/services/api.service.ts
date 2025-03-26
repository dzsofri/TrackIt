import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { catchError, Observable, of } from 'rxjs';

import { map } from 'rxjs/operators';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) { }

  private tokenName = environment.tokenName;
  private server = environment.serverUrl;

  getToken(): String | null {
    return localStorage.getItem(this.tokenName);
  }

  tokenHeader(): { headers: HttpHeaders } {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return { headers };
  }

  registration(data: object) {
    return this.http.post(this.server + '/users/register', data).pipe(
      catchError(error => {
        console.error('Registration failed', error);
        return of({ message: 'Registration failed' });
      })
    );
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.server}/users/login`, { email, password }).pipe(
      catchError(error => {

        return of({ message: error.error.message, invalidFields: error.error.invalid });
      })
    );
  }


  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.server}/users/forgot-password`, { email }).pipe(
      catchError(error => {
        console.error('Forgot password failed', error);
        return of({ message: 'Forgot password failed' });
      })
    );
  }


  resetPassword(email: string, token: string, newPassword: any): Observable<any> {
    return this.http.post<any>(`${this.server}/users/reset-password`, { email, token, newPassword }).pipe(
      catchError(error => {
        console.error('Password reset failed', error);
        return of({ message: 'Password reset failed' });
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
      `${this.server}/posts/all`,
      this.tokenHeader()
    ).pipe(
      catchError(error => {
        console.error('Error fetching posts:', error);
        return of({ posts: [], count: 0, message: 'Error occurred while fetching posts' });
      })
    );
  }

  getFeedbackQuestions(): Observable<{ questions: { id: number, question: string }[], message?: string }> {
    return this.http.get<{ questions: { id: number, question: string }[], message?: string }>(
      `${this.server}/feedbacks/questions`,
      this.tokenHeader()
    ).pipe(
      catchError(error => {
        console.error('Error fetching feedback questions:', error);
        return of({ questions: [], message: 'Error occurred while fetching feedback questions' });
      })
    );
  }

  getFeedbackData(questionId: number): Observable<{ questionId: number, feedbackCount: Record<number, number>, message?: string }> {
    return this.http.get<{ questionId: number, feedbackCount: Record<number, number>, message?: string }>(
      `${this.server}/feedbacks/data/${questionId}`,
      this.tokenHeader()
    ).pipe(
      catchError(error => {
        console.error('Error fetching feedback data:', error);
        return of({ questionId, feedbackCount: {}, message: 'Error occurred while fetching feedback data' });
      })
    );
  }

  getPostsByMonth(month: number, year: number): Observable<{ posts: any[], count: number, message?: string }> {
    return this.http.get<{ posts: any[], count: number, message?: string }>(
      `${this.server}/posts/by-month?month=${month}&year=${year}`,
      this.tokenHeader()
    ).pipe(
      map((response: { posts: any[], count: number }) => {
        if (!response.posts || response.posts.length === 0) {
          return { posts: [], count: 0, message: 'Nincs adat a kiválasztott hónapra' };
        }
        return response;
      }),
      catchError(error => {
        console.error('Hiba a havi posztok lekérdezésekor:', error);
        return of({ posts: [], count: 0, message: 'Hiba történt az adatok lekérése során' });
      })
    );
  }

  updateUser(id: string, userData: any): Observable<any> {
    return this.http.put<any>(`${this.server}/users/${id}`, userData, this.tokenHeader()).pipe(
      catchError(error => {
        console.error('Error updating user:', error);
        return of({ message: 'User update failed' });
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

  getLoggedUser(table: string, id: string): Observable<any> {
    return this.http.get(`${this.server}/${table}/users/${id}`, this.tokenHeader());
  }

  deleteFriendRequest(table: string, id: string) {
    return this.http.delete(`${this.server}/${table}/friendrequests/${id}`, this.tokenHeader());
  }

  acceptFriendRequest(table: string, id: string) {
    return this.http.post(`${this.server}/${table}/friendrequests/${id}/accept`, {}, this.tokenHeader());
  }

  updateTaskStatus(taskId: string, newStatus: string): Observable<any> {
    const body = { status: newStatus };
    return this.http.patch<any>(`${this.server}/tasks/${taskId}/status`, body, this.tokenHeader()).pipe(
        catchError(error => {
            console.error('Feladat státuszának frissítése sikertelen', error);
            return of(error);
        })
    );
}




}
