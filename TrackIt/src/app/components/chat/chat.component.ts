



import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  imports: [CommonModule],
})
export class ChatComponent {
  isSidebarOpen = true;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen; 
  }

  contacts = [
    { name: 'Lois Griffin', message: 'Sent you a message', time: '34m', avatar: 'lois.png', unread: true },
    { name: 'Stewie Griffin', message: 'Sent you a message', time: '17h', avatar: 'stewie.png', unread: true },
    { name: 'Joe Swanson', message: 'Sent you a message', time: '20h', avatar: 'joe.png', unread: false },
    { name: 'Vargacz Gergő', message: 'Ja, jövök', time: '34m', avatar: 'gergo.png', unread: true },
    { name: 'Glenn Quagmire', message: 'The silence lmao', time: '20h', avatar: 'quagmire.png', unread: false },
    { name: 'Herbert', message: 'Active 6m ago', time: '', avatar: 'herbert.png', unread: false },
    { name: 'Adam West', message: 'Active today', time: '', avatar: 'adam.png', unread: false },
    { name: 'Philip J. Fry', message: 'I feel like I was frozen for 1000...', time: '20h', avatar: 'fry.png', unread: false },
    { name: 'Cleveland Brown', message: 'Active 5h ago', time: '', avatar: 'cleveland.png', unread: false },
    { name: 'Chris Griffin', message: 'Active today', time: '', avatar: 'chris.png', unread: false },
    { name: 'Bonnie Swanson', message: '', time: '', avatar: 'bonnie.png', unread: false }
  ];

  messages = [
    { sender: 'user', text: 'Helló!', time: '11:31 AM' },
    { sender: 'user', text: 'Nincs kedved összefutni valahol?', time: '11:31 AM' },
    { sender: 'other', text: 'Mekkora ötlet! Durranjon hát.', time: '11:35 AM' },
    { sender: 'user', text: 'Üdv!', time: '11:36 AM' }
  ];
}