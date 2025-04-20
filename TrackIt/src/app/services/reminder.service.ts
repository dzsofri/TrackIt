import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReminderService {
  private reminderSubject = new BehaviorSubject<string | null>(null);
  reminder$ = this.reminderSubject.asObservable();

  showReminder(message: string) {
    this.reminderSubject.next(message);
  }

  clearReminder() {
    this.reminderSubject.next(null);
  }
}