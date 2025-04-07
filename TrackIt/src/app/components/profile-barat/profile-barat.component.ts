import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../services/message.service';
import { Friend_Request } from '../../interfaces/friend_requests';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-barat',
  imports: [CommonModule, AlertModalComponent],
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

  popupMessage: string | null = null;
  showPopup: boolean = false;
  selectedFriendId: string | null = null;
  selectedAction: 'accept' | 'delete' | null = null;

  modalVisible = false;
  modalType: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalMessage = '';
  invalidFields: string[] = [];

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

  setActiveTab(tabName: string) {
    this.activeTab = tabName;
  }

  FriendRequest() {
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

  openPopup(action: 'accept' | 'delete', id: string) {
    this.selectedFriendId = id;
    this.selectedAction = action;

    if (action === 'delete') {
      this.popupMessage = 'Biztosan elutasítod/törlöd ezt a felhasználót?';
    } else if (action === 'accept') {
      this.popupMessage = 'Biztosan megerősíti ezt a barátkérést?';
    }

    this.showPopup = true;
  }

  confirmAction() {
    if (this.selectedFriendId && this.selectedAction) {
      if (this.selectedAction === 'accept') {
        this.api.acceptFriendRequest('friends', this.selectedFriendId).subscribe(
          () => {
            this.modalMessage = 'A barátkérés megerősítve!';
            this.modalType = 'success';
            this.modalVisible = true;
            this.FriendRequest();
            this.closePopup();
            this.autoCloseModal();
          },
          () => {
            this.modalMessage = 'A barátkérés nem található.';
            this.modalType = 'error';
            this.modalVisible = true;
            this.closePopup();
            this.autoCloseModal();
          }
        );
      } else if (this.selectedAction === 'delete') {
        this.api.deleteFriendRequest('friends', this.selectedFriendId).subscribe(
          () => {
            this.modalMessage = 'A barátkérés elutasítva és törölve lett!';
            this.modalType = 'success';
            this.modalVisible = true;
            this.FriendRequest();
            this.closePopup();
            this.autoCloseModal();
          },
          () => {
            this.modalMessage = 'A barátkérés nem található.';
            this.modalType = 'error';
            this.modalVisible = true;
            this.closePopup();
            this.autoCloseModal();
          }
        );
      }
    }
  }

  closePopup() {
    this.showPopup = false;
    this.popupMessage = null;
    this.selectedFriendId = null;
    this.selectedAction = null;
  }

  autoCloseModal() {
    setTimeout(() => {
      this.modalVisible = false;
    }, 5000);
  }
}
