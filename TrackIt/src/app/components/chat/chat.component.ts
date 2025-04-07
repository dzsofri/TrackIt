import { Component, OnInit } from '@angular/core';
import { SocketService, ChatMessage } from '../../services/socket.service';
import { AuthService } from '../../services/auth.service'; // AuthService importálása
import { ApiService } from '../../services/api.service'; // ApiService importálása
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class ChatComponent implements OnInit {
  isSidebarOpen = true;
  message = '';
  messages: ChatMessage[] = [];

  currentUser: string = '';  // Inicializáljuk az üres stringet
  currentDate!: string;  // Az aktuális dátum és idő

  contacts: any[] = [];  // Felhasználók tárolása

  constructor(
    private socketService: SocketService,
    private authService: AuthService, // AuthService injektálása
    private apiService: ApiService  // ApiService injektálása
  ) {}

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  ngOnInit(): void {
    // Beállítjuk az aktuális dátumot, amit a template-ben használunk
    this.currentDate = new Date().toLocaleString();  // Az aktuális dátum és idő

    // Beállítjuk a felhasználó nevét, amit az AuthService-től kapunk
    const user = this.authService.loggedUser();
    if (user) {
      this.currentUser = user.name; // A felhasználó neve
    }

    // Lekérjük az összes felhasználót az API-ból
    this.apiService.getUsers().subscribe(response => {
      if (response && response.users) {
        this.contacts = response.users; // Felhasználók hozzáadása a kontakthoz
      }
    });

    this.socketService.onMessage((msg: ChatMessage) => {
      this.messages.push(msg); // Üzenet hozzáadása
    });
  }

  sendMessage(): void {
    if (this.message.trim()) {
      const newMsg: ChatMessage = {
        sender: this.currentUser,  // A felhasználó neve
        text: this.message.trim(),
        time: new Date().toLocaleTimeString()
      };
      this.socketService.sendMessage(newMsg);  // Üzenet küldése
      this.message = '';  // Üzenet küldése után üresre állítjuk
    }
  }
  
}
