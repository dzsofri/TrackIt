import { Component, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { ChatMessage } from '../../interfaces/chatMessage';

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
  oldmessages: ChatMessage[] = [];
  currentUser: string = '';
  currentUserId: string = '';
  selectedContact: any = null;
  contacts: any[] = [];
  currentDate!: string;

  constructor(
    private socketService: SocketService,
    private authService: AuthService,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef // Az Angular változás detektálása
  ) {}

  ngOnInit(): void {

    console.log('All senders:', this.messages.map(msg => msg.sender));

    this.currentDate = new Date().toISOString();
    const user = this.authService.loggedUser();
    if (user) {
      this.currentUser = user.name;
      this.currentUserId = user.id;
    }

    this.apiService.getUsers().subscribe(response => {
      this.contacts = response.users.filter((u: any) => u.id !== this.currentUserId);
    });

    if (this.currentUserId) {
      this.socketService.joinPrivateRoom(this.currentUserId);
    }

    this.socketService.onMessage((msg: ChatMessage) => {
      this.handleIncomingMessage(msg);
    });
  }

  // Üzenetek kezelése és frissítése
  handleIncomingMessage(msg: ChatMessage) {
    console.log('Incoming message:', msg); // Teljes üzenet kiírása
    console.log('Sender:', msg.sender); // Csak a sender mező kiírása

    if (this.selectedContact && (msg.senderId === this.selectedContact.id || msg.receiverId === this.selectedContact.id)) {
      this.messages = [...this.messages, msg]; // Új üzenet hozzáadása
      this.scrollToBottom();
      this.cdr.detectChanges(); // Frissítjük a nézetet
    }
  }
  selectContact(contact: any): void {
    this.selectedContact = contact;
    this.messages = []; // Üzenetek törlése új kontaktus választásakor

    // Betöltjük az üzeneteket az API-ból
    this.apiService.getMessagesBetweenUsers(this.currentUserId, contact.id).subscribe(response => {
      console.log('Messages between users:', response);

      if (response && Array.isArray(response)) {
        // Az új üzenetek hozzáadása az oldmessages tömbhöz
        for (let i = 0; i < response.length; i++) {
          // Feltételezzük, hogy a felhasználói név lekérhető az ID alapján
          this.apiService.getUserById(response[i].senderId).subscribe(user => {
            response[i].sender = {
              id: response[i].senderId,
              name: user.name // A lekérdezett név
            };
          });
          this.oldmessages = [...this.oldmessages, response[i]];
        }

        // Üzenetek betöltése az oldmessages-ból
        this.messages = [...this.oldmessages];
        this.cdr.detectChanges(); // Biztosítjuk, hogy az Angular észlelje a változást
      }
    });

    // Csak belépünk a szobába, nem regisztrálunk újra eseménykezelőt
    this.socketService.joinPrivateRoom(contact.id);

    // Ha új üzenet érkezik, kezeljük azt
    this.socketService.onMessage((msg: ChatMessage) => {
      this.handleIncomingMessage(msg);
    });
  }









  // Üzenet küldése
  sendMessage(): void {
    if (this.message.trim() && this.selectedContact) {
      const newMsg: ChatMessage = {
        senderId: this.currentUserId,
        sender: this.currentUser,
        receiverId: this.selectedContact.id,
        receiver: this.selectedContact.name,
        message: this.message.trim(),
        createdAt: new Date().toISOString(),

      };

      // WebSocket-en keresztül üzenet küldése
      this.socketService.sendPrivateMessage(newMsg);

      // Üzenet mentése API-n keresztül
      this.apiService.sendMessage(this.currentUserId, this.selectedContact.id, this.message.trim()).subscribe(
        response => console.log('Message saved:', response),
        err => console.error('Error saving message:', err)
      );

      // Üzenet hozzáadása a local messages tömbhöz
      this.messages = [...this.messages, newMsg]; // Új üzenet hozzáadása
      this.message = ''; // Üzenet mező kiürítése
      this.scrollToBottom();
    }
  }

  // Görgetés az üzenetlista aljára
  scrollToBottom(): void {
    setTimeout(() => {
      const chatContainer = document.getElementById('chat-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }

  // Oldalsáv nyitása és zárása
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  // Hiba kép kezelése
  onImageError(event: any) {
    event.target.src = 'assets/images/profileKep.png';
  }
}
