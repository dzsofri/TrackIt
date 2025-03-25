import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../services/message.service';
import { Friend_Request } from '../../interfaces/friend_requests';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-barat',
  imports: [CommonModule],
  templateUrl: './profile-barat.component.html',
  styleUrl: './profile-barat.component.scss'
})
export class ProfileBaratComponent {
constructor(
    private api: ApiService,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private message: MessageService
  ) {}

  friend_requests: Friend_Request[] = [];
  senderNames: { [key: string]: string } = {};

  activeTab: string = 'statisztika';
  setActiveTab(tabName: string) {
    this.activeTab = tabName;
  }

  id: string = "";
  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.auth.user$.subscribe(user => {
      if (user) {
        this.id = user.id;
        this.FriendRequest();
      }
    });
  }

  FriendRequest(){
    this.api.readFriendRequests('friends', this.id).subscribe({
      next: (res: any) => {
        if (!res || res.friendRequests.length === 0) {
            console.warn('No user friend_requests found.');
            this.friend_requests = [];
            return;
        }
        this.friend_requests = res.friendRequests.filter((request: Friend_Request) =>
          request.status === 'pending' || request.status === 'accepted'
        );
        this.friend_requests.forEach(request => {
          this.api.getLoggedUser('users', request.senderId.toString()).subscribe((res: any) => {
              const user = res.user;
              this.senderNames[request.senderId] = user.name ?? 'Ismeretlen felhasználó';
          });
        });
      },
      error: (err) => {
          console.error('Error fetching user friend_requests:', err);
          this.friend_requests = [];
      }
    });
  }
  hasAcceptedFriends(): boolean {
    return this.friend_requests.some(request => request.status === 'accepted');
  }
  hasPendingFriends(): boolean {
    return this.friend_requests.some(request => request.status === 'pending');
  }
  deleteFriend(id: string) {
    if (confirm('Biztosan elutasítod/törlöd a barátkérést?')) {
      this.api.deleteFriendRequest('friends', id).subscribe(
        (res: any) => {
          this.message.showMessage('OK', 'A barátkérés elutasítva és törölve lett!', 'success');
          this.FriendRequest();
          setTimeout(() => {
            if (this.friend_requests.length === 0) {
              this.message.showMessage('Info', 'Jelenleg nincs követési kérésed!', 'info');
            }
          }, 100);
        },
        (error: any) => {
          this.message.showMessage('Hiba', 'A barátkérés nem található.', 'error');
        }
      );
    }
  }
  acceptFriend(id: string) {
    if (confirm('Biztosan megerősíti ezt a barátkérést?')) {
      this.api.acceptFriendRequest('friends', id).subscribe(
        (res: any) => {
          this.message.showMessage('OK', 'A barátkérés megerősítve!', 'success');
          this.FriendRequest();
          setTimeout(() => {
            if (this.friend_requests.length === 0) {
              this.message.showMessage('Info', 'Jelenleg nincs követési kérésed!', 'info');
            }
          }, 100);
        },
        (error: any) => {
          this.message.showMessage('Hiba', 'A barátkérés nem található.', 'error');
        }
      );
    }
  }
}