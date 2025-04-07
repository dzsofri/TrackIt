import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

export interface ChatMessage {
  sender: string;
  text: string;
  time: string;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000');
  }

  sendMessage(msg: ChatMessage): void {
    this.socket.emit('message', msg); // Üzenet küldése a szerverre
  }

  onMessage(callback: (msg: ChatMessage) => void): void {
    this.socket.on('message', callback); // Üzenet fogadása a szerverről
  }
}
