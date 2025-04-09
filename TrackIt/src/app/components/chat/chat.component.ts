import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '../../interfaces/chatMessage';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  isSidebarOpen = true;
  message = '';
  messages: ChatMessage[] = [];
  oldmessages: ChatMessage[] = [];
  currentUser: User | null = null;
  currentUserId: string = '';
  selectedContact: any = null;
  contacts: any[] = [];
  currentDate!: string;
  private shouldScroll = false;
  isDarkMode = false;
  onlineUsers: { userId: string, status: string }[] = []; // Online felhasználók státusza

  constructor(
    private socketService: SocketService,
    private authService: AuthService,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {
    this.socketService.userStatus$.subscribe(status => this.onlineUsers = status);
  }

  ngOnInit(): void {
    this.initializeCurrentUser();
    this.loadContacts();
    this.joinPrivateRoom();
    this.listenForMessages();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottomIfNeeded();
  }

  // Inicializálja az aktuális felhasználót
  private initializeCurrentUser(): void {
    const user = this.authService.loggedUser();
    if (user) {
      this.currentUser = user;
      this.currentUserId = user.id;
    }
    this.currentDate = new Date().toISOString();
  }

  // Betölti a felhasználók listáját
  private loadContacts(): void {
    this.apiService.getUsers().subscribe(response => {
      this.contacts = response.users.filter((u: any) => u.id !== this.currentUserId);
      if (this.contacts.length > 0) {
        this.selectContact(this.contacts[0]);
      }
    });
  }

  // Belép a privát szobába a socketen
  private joinPrivateRoom(): void {
    if (this.currentUserId) {
      this.socketService.joinPrivateRoom(this.currentUserId);
    }
  }

  // Üzenetek fogadása
  private listenForMessages(): void {
    this.socketService.onMessage((msg: ChatMessage) => this.handleIncomingMessage(msg));
  }

  // Üzenetek feldolgozása
  private handleIncomingMessage(msg: ChatMessage): void {
    this.setSenderInfo(msg);
    if (this.isMessageForSelectedContact(msg)) {
      this.addNewMessage(msg);
    }
  }

  // Beállítja az üzenet feladó adatokat, ha nem található
  private setSenderInfo(msg: ChatMessage): void {
    if (!msg.sender) {
      this.apiService.getUserById(msg.senderId).subscribe(user => {
        if (user) {
          msg.sender = user;
        }
      });
    }
  }

  // Ellenőrzi, hogy az üzenet a kiválasztott kapcsolathoz tartozik-e
  private isMessageForSelectedContact(msg: ChatMessage): boolean {
    return this.selectedContact && (msg.senderId === this.selectedContact.id || msg.receiverId === this.selectedContact.id);
  }

  // Új üzenet hozzáadása a listához, ha nem ismétlődik
  private addNewMessage(msg: ChatMessage): void {
    const exists = this.messages.some(existingMsg => existingMsg.createdAt === msg.createdAt && existingMsg.message === msg.message);
    if (!exists) {
      this.messages = [...this.messages, msg];
      this.shouldScroll = true;
      this.cdr.detectChanges();
    }
  }

  // Kiválasztja a kapcsolatot és betölti a hozzá tartozó üzeneteket
  selectContact(contact: any): void {
    this.selectedContact = contact;
    this.messages = [];
    this.loadMessages(contact);
    this.socketService.joinPrivateRoom(contact.id);
    this.listenForMessages();
  }

  // Üzenetek betöltése a két felhasználó között
  private loadMessages(contact: any): void {
    this.apiService.getMessagesBetweenUsers(this.currentUserId, contact.id).subscribe(response => {
      if (response && Array.isArray(response)) {
        this.oldmessages = [...response];
        this.messages = [...this.oldmessages];
        this.shouldScroll = true;
        this.cdr.detectChanges();
      }
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

      this.socketService.sendPrivateMessage(newMsg);
      this.apiService.sendMessage(this.currentUserId, this.selectedContact.id, this.message.trim()).subscribe();
      this.messages = [...this.messages, newMsg];
      this.message = '';
      this.shouldScroll = true;
    }
  }

  // Üzenet lista aljára görgetés, ha szükséges
  private scrollToBottomIfNeeded(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  // Görgetés az üzenetlista aljára
  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }

  // Oldalsó menü nyitása/zárása
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  // Hiba esetén az alapértelmezett profilkép beállítása
  onImageError(event: any): void {
    event.target.src = 'assets/images/profileKep.png';
  }

  // Kép URL lekérése
  getImageSrc(imageName: string): string {
    return `assets/icons/${imageName}${this.isDarkMode ? '_dark_theme.png' : '.png'}`;
  }

  // Online státusz ellenőrzése
  isUserOnline(userId: string): boolean {
    const user = this.onlineUsers.find(u => u.userId === userId);
    return user ? user.status === 'online' : false; // Ha nincs státusz, akkor offline
  }
}
