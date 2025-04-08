import { Component, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { ChatMessage } from '../../interfaces/chatMessage';
import { User } from '../../interfaces/user';

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
  currentUser: User | null = null;
  currentUserId: string = '';
  selectedContact: any = null;
  contacts: any[] = [];
  currentDate!: string;

  constructor(
    private socketService: SocketService,
    private authService: AuthService,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef // Angular change detection
  ) {}

  ngOnInit(): void {
    this.currentDate = new Date().toISOString();
    const user = this.authService.loggedUser();
    if (user) {
      this.currentUser = user;  // Assign the full user object
      this.currentUserId = user.id;
    }

    this.apiService.getUsers().subscribe(response => {
      this.contacts = response.users.filter((u: any) => u.id !== this.currentUserId);
    });

    if (this.currentUserId) {
      this.socketService.joinPrivateRoom(this.currentUserId);
    }

    // Listen for incoming messages via WebSocket
    this.socketService.onMessage((msg: ChatMessage) => {
      this.handleIncomingMessage(msg);
    });
  }

  handleIncomingMessage(msg: ChatMessage) {
    console.log('Incoming message:', msg); // Log the full message
    console.log('Sender:', msg.sender); // Log just the sender field

    // Csak akkor adja hozzá a feladót, ha nem található
    if (!msg.sender) {
      this.apiService.getUserById(msg.senderId).subscribe(user => {
        if (user) {
          msg.sender = user;  // Assign the full user object to msg.sender
          console.log('Updated sender:', msg.sender);  // Log updated sender
        }
      });
    }

    // Ellenőrizzük, hogy a beérkezett üzenet már szerepel-e a messages listában
    if (this.selectedContact && (msg.senderId === this.selectedContact.id || msg.receiverId === this.selectedContact.id)) {
      const existingMessage = this.messages.find(existingMsg => existingMsg.createdAt === msg.createdAt && existingMsg.message === msg.message);

      if (!existingMessage) {
        // Ha az üzenet nem létezik, akkor hozzáadjuk
        this.messages = [...this.messages, msg];
        this.scrollToBottom();
        this.cdr.detectChanges(); // Biztosítjuk, hogy a view frissüljön
      }
    }
  }

  selectContact(contact: any): void {
    this.selectedContact = contact;
    this.messages = []; // Üzenetek törlése új kontaktus választásakor

    // Betöltjük az üzeneteket az API-ból a kiválasztott kontaktus számára
    this.apiService.getMessagesBetweenUsers(this.currentUserId, contact.id).subscribe(response => {
      console.log('Messages between users:', response);

      if (response && Array.isArray(response)) {
        // Az új üzenetek hozzáadása az oldmessages tömbhöz
        this.oldmessages = [...response];

        // Üzenetek betöltése az oldmessages-ból
        this.messages = [...this.oldmessages];
        this.cdr.detectChanges(); // Biztosítjuk, hogy az Angular észlelje a változást
      }
    });

    // Csak belépünk a szobába, nem regisztrálunk újra eseménykezelőt
    this.socketService.joinPrivateRoom(contact.id);

    // Ha új üzenet érkezik, kezeljük azt
    this.socketService.onMessage((msg: ChatMessage) => {
      console.log('Received message:', msg); // Üzenet logolása
      this.handleIncomingMessage(msg);
    });
  }


  sendMessage(): void {
    if (this.message.trim() && this.selectedContact) {
      const newMsg: ChatMessage = {
        senderId: this.currentUserId,
        sender: this.currentUser,  // Send full user object
        receiverId: this.selectedContact.id,
        receiver: this.selectedContact.name,
        message: this.message.trim(),
        createdAt: new Date().toISOString(),
      };

      // Send message via WebSocket
      this.socketService.sendPrivateMessage(newMsg);

      // Save message via API
      this.apiService.sendMessage(this.currentUserId, this.selectedContact.id, this.message.trim()).subscribe(
        response => console.log('Message saved:', response),
        err => console.error('Error saving message:', err)
      );

      // Add the message to the local messages array
      this.messages = [...this.messages, newMsg]; // Add new message
      this.message = ''; // Clear the message input field
      this.scrollToBottom();
    }
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const chatContainer = document.getElementById('chat-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  onImageError(event: any) {
    event.target.src = 'assets/images/profileKep.png';
  }
}
