import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../environments/environment';
import { ChatMessage } from '../interfaces/chatMessage';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private userStatusSubject: BehaviorSubject<{ userId: string, status: string }[]> = new BehaviorSubject<{ userId: string, status: string }[]>([]);
  public userStatus$ = this.userStatusSubject.asObservable();

  constructor() {
    this.socket = io(environment.serverUrl);

    // WebSocket kapcsolat eseményeinek kezelése
    this.socket.on('connect', () => {
      console.log('WebSocket connected:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });




  }

  // Szoba csatlakoztatása
  joinPrivateRoom(userId: string): void {
    this.socket.emit('joinPrivateRoom', userId);
    console.log('Joining room for user:', userId); // Debug log
  }

  // Üzenet küldése
  sendPrivateMessage(msg: ChatMessage): void {
    console.log('Sending message:', msg); // Debug log
    this.socket.emit('privateMessage', msg);
  }

  // Üzenet fogadása
  onMessage(callback: (msg: ChatMessage) => void): void {
    this.socket.on('messageReceived', (msg: ChatMessage) => {
      console.log('Message received:', msg); // Log every received message
      callback(msg); // Callback on received message
    });
  }

}
