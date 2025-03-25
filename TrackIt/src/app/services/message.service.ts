import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Message } from '../interfaces/message';

@Injectable({
  providedIn: 'root'
})

export class MessageService {

  private messageSubject = new BehaviorSubject<Message | null>(null);
  public  messageSubject$ = this.messageSubject.asObservable();

  showMessage(title: string, message: string, severity: string){
    this.messageSubject.next({ title, message, severity });
  }


  clearMessage(){
    this.messageSubject.next(null);
  }
}
