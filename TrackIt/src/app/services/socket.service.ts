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

    // Státusz változások figyelése
    this.socket.on('userStatusChanged', (data: { userId: string, status: string }) => {
      console.log('User status changed:', data);
      this.updateUserStatus(data); // Frissítjük a státuszt
    });

    // Felhasználó offline státusza (ha már nem csatlakozik)
    this.socket.on('userOffline', (userId: string) => {
      this.updateUserStatus({ userId, status: 'offline' });
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

  // Státusz frissítése
  private updateUserStatus(data: { userId: string, status: string }) {
    const currentStatus = this.userStatusSubject.value;
    const userIndex = currentStatus.findIndex(u => u.userId === data.userId);

    if (data.status === 'offline') {
      // Ha a felhasználó offline, akkor eltávolítjuk a listából
      if (userIndex > -1) {
        currentStatus.splice(userIndex, 1); // Töröljük az offline felhasználót
      }
    } else {
      if (userIndex > -1) {
        // Ha létezik már a felhasználó, frissítjük a státuszt
        currentStatus[userIndex].status = data.status;
      } else {
        // Ha nem létezett még, hozzáadjuk
        currentStatus.push(data);
      }
    }

    // A frissített státuszt kiemeljük a BehaviorSubject-en
    this.userStatusSubject.next([...currentStatus]);
  }
}
