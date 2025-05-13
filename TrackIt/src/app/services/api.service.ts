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
  public server = environment.serverUrl;

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

  updateUserData(id: string, userData: any): Observable<any> {
    return this.http.patch<any>(`${this.server}/users/${id}`, userData, this.tokenHeader()).pipe(
      catchError(error => {
        console.error('Update failed', error);
        return of({ message: 'Update failed' });
      })
    );
  }


  setReminder(id: string, data: { reminderAt: any }): Observable<any> {
    return this.http.post<any>(`${this.server}/users/reminder/${id}`, data, this.tokenHeader()).pipe(
      catchError(error => {
        console.error('Emlékeztető beállítása sikertelen:', error);
        return of({ message: 'Emlékeztető beállítása sikertelen' });
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

  readUserChallengesFriends(table: string, userId: string): Observable<any> {
    return this.http.get(`${this.server}/${table}/${userId}`, this.tokenHeader());
  }

  readChallengeParticipants(table: string, secondaryId: string): Observable<any> {
    return this.http.get(`${this.server}/${table}/${secondaryId}`, this.tokenHeader());
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

  updateFriendData(id: string, friendData: any): Observable<any> {
    return this.http.patch<any>(`${this.server}/friends/update-active-challenge/${id}`, friendData, this.tokenHeader()).pipe(
      catchError(error => {
        console.error('Update failed', error);
        return of({ message: 'Update failed' });
      })
    );
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

  postCompletedTask(userId: string, taskId: string): Observable<any> {
    return this.http.post(`${this.server}/user_statistics/completedTask`, { userId, taskId }, this.tokenHeader());
  }

  postMissedTask(userId: string, taskId: string): Observable<any> {
    return this.http.post(`${this.server}/user_statistics/missedTask`, { userId, taskId }, this.tokenHeader());
  }

  sendMessage(senderId: string, receiverId: string, message: string): Observable<any> {
    return this.http.post<any>(`${this.server}/chat/send`, {
      senderId,
      receiverId,
      message
    }, this.tokenHeader());
  }


  getMessagesBetweenUsers(user1Id: string, user2Id: string): Observable<any> {
    return this.http.get<any>(`${this.server}/chat/messages/${user1Id}/${user2Id}`, this.tokenHeader());
  }


  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${this.server}/users/${userId}`, this.tokenHeader()).pipe(

    );
  }

  updateStatus(status: string): Observable<any> {
    const url = `${this.server}/users/status`;
    console.log('Kérés URL:', url); // <- EZT ITT

    const body = { status };

    return this.http.patch<any>(url, body, this.tokenHeader()).pipe(
      map(response => {
        console.log('Státusz frissítve:', response);
        return response;
      }),
      catchError(error => {
        console.error('Hiba a státusz frissítésekor:', error);
        return of({ message: 'A státusz frissítése sikertelen' });
      })
    );
  }
  getStatus(): Observable<any> {
    const url = `${this.server}/users/status`;
    console.log('Kérés URL:', url); // Ellenőrizd, hogy helyes-e az URL

    return this.http.get<any>(url, this.tokenHeader()).pipe(
        map(response => {
            console.log('Felhasználó státusza:', response.status);
            return response.status;  // Visszaadjuk a státuszt
        }),
        catchError(error => {
            console.error('Hiba a státusz lekérésekor:', error);
            return of('Hiba történt a státusz lekérésekor');
        })
    );
}



 // Poszt létrehozása
 createPost(postData: { title: string; body: string, status: string}): Observable<any> {
  return this.http.post<any>(`${this.server}/posts`, postData, this.tokenHeader()).pipe(
    catchError(error => {
      console.error('Hiba a bejegyzés létrehozásakor:', error);
      return of({ message: 'Bejegyzés létrehozása sikertelen' });
    })
  );
}

// Poszt módosítása
updatePost(postId: string, postData: { title: string; body: string; status: string }): Observable<any> {
  return this.http.put<any>(`${this.server}/posts/${postId}`, postData, this.tokenHeader()).pipe(
    catchError(error => {
      console.error('Hiba a bejegyzés frissítésekor:', error);
      return of({ message: 'Bejegyzés frissítése sikertelen' });
    })
  );
}


// Poszt törlése
deletePost(postId: string): Observable<any> {
  return this.http.delete(`${this.server}/posts/${postId}`, this.tokenHeader()).pipe(
    catchError(error => {
      console.error('Hiba a poszt törlésekor:', error);
      return of({ message: 'Poszt törlése sikertelen' });
    })
  );

}

addHabitTrackingRecord(data: {
  date: string,
  achieved: boolean,
  value: number,
  habitId: string
}): Observable<any> {
  return this.http.post<any>(`${this.server}/habit_tracker`, data, this.tokenHeader()).pipe(
    catchError(error => {
      console.error('Hiba a szokás mentésekor:', error);
      return of({ message: 'Szokás mentése sikertelen' });
    })
  );
}

createHabit(habitData: {
  habitName: string;
  targetValue: number;
  currentValue: number;
  frequency: string;
  userId: string;
}): Observable<any> {
  return this.http.post<any>(`${this.server}/habits`, habitData, this.tokenHeader()).pipe(
    catchError(error => {
      console.error('Hiba a szokás létrehozásakor:', error);
      return of({ message: 'Szokás létrehozása sikertelen' });
    })
  );
}


 createEvent(data: { title: string; description: string; startTime: string; endTime: string; color: string; userId: string;}): Observable<any> {
  return this.http.post<any>(`${this.server}/events`, data, this.tokenHeader()).pipe(
    catchError(error => {
      console.error('Event creation failed', error);
      return of({ message: 'Event creation failed' });
    })
  );
}

getEvents(): Observable<any[]> {
  return this.http.get<any[]>(`${this.server}/events`, this.tokenHeader()).pipe(
    catchError(error => {
      console.error('Error fetching events:', error);
      return of([]);
    })
  );
}

getEventById(id: string): Observable<any> {
  return this.http.get<any>(`${this.server}/events/${id}`, this.tokenHeader()).pipe(
    catchError(error => {
      console.error('Error fetching event:', error);
      return of(null);
    })
  );
}

getEventByUserId(userId: string): Observable<any> {
  return this.http.get<any>(`${this.server}/events/user/${userId}`, this.tokenHeader()).pipe(
    catchError(error => {
      console.error('Error fetching events for user:', error);
      return of(null);
    })
  );
}


updateEvent(id: string, data: { title?: string; description?: string; startTime?: string; endTime?: string; color?: string }): Observable<any> {
  return this.http.put<any>(`${this.server}/events/${id}`, data, this.tokenHeader()).pipe(
    catchError(error => {
      console.error('Error updating event:', error);
      return of({ message: 'Event update failed' });
    })
  );
}


deleteEvent(id: string): Observable<any> {
  return this.http.delete<any>(`${this.server}/events/${id}`, this.tokenHeader()).pipe(
    catchError(error => {
      console.error('Error deleting event:', error);
      return of({ message: 'Event deletion failed' });
    })
  );
}


}



