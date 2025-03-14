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

  getAllUsers(): Observable<{ users: User[], count: number,message: string }> {
    return this.http.get<{ users: User[],count: number, message: string }>(this.server + '/users', this.tokenHeader()).pipe(
      catchError(error => {
        console.error('Error fetching users:', error);
        return of({ users: [],count: 0, message: 'Error occurred while fetching users' });
      })
    );
  }

  resetPassword(email: string, token: string, newPassword: any): Observable<any> {
    return this.http.post<any>(`${this.server}/users/reset-password`, { email, token, newPassword }).pipe(
      catchError(error => {
        console.error('Password reset failed', error);
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
      `${this.server}/posts/all`,
      this.tokenHeader()
    ).pipe(
      catchError(error => {
        console.error('Error fetching posts:', error);
        return of({ posts: [], count: 0, message: 'Error occurred while fetching posts' });
      })
    );
  }

// Ezt a kódot feltételezve, hogy a backend biztosítja az id mezőt
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
        // Ha nincs adat, de a kérés sikeres volt, csak egy üzenetet adunk vissza
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
  
  
  

  read_Stat(table: string, field: string, op: string, value: string) {
    return this.http.get(`${this.server}/public/${table}/${field}/${op}/${value}`);
  }
}
