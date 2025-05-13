import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Badge } from '../../interfaces/badges';
import { Friend_Request } from '../../interfaces/friend_requests';
import { User_Challenge } from '../../interfaces/user_challenges';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';

@Component({
  selector: 'app-sajat-kihivas',
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule, MatSelectModule, MatFormFieldModule, AlertModalComponent],
  templateUrl: './sajat-kihivas.component.html',
  styleUrl: './sajat-kihivas.component.scss'
})
export class SajatKihivasComponent {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private api: ApiService
  ) {
    this.setMinDate();
  }

  private setMinDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.minDate = `${year}-${month}-${day}`;
  }

  user = {
    id: '',
    name: '',
    email: '',
    password: '',
    role: '',
    pictureId: '',
    createdAt: '',
    reminderAt: '',
    confirm: '',
  };

  id: string = '';

  badges: Badge[] = [];

  friend_requests: Friend_Request = {
    id: '',
    senderId: 0,
    receiverId: 0,
    status: '',
  };
  showFriendRequests: Friend_Request[] = [];
  selectedFriendId: string | null = null;
  senderNames: { [key: string]: string } = {};
  invalidFields: string[] = [];
  status: number = 0;
  selectedFriendIds: string[] = [];
  addedFriends: { id: string; name: string; imageUrl: string;}[] = [];

  popupMessage: string | null = null;
  showPopup: boolean = false;
  selectedAction: 'accept' | 'delete' | 'remove' | null = null;

  modalVisible = false;
  modalType: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalMessage = '';
  imagePreviewUrl: string | null = null;

  errorMessage: string = '';
  minDate: string = '';

  user_challenges: User_Challenge = {
    id: '',
    secondaryId: '',
    userId: 0,
    progressPercentage: 0,
    createdAt: '',
    completedAt: '',
    status: 0,
    durationDays: 0,
    rewardPoints: 0,
    finalDate: '',
    challengeName: '',
    challengeDescription: '',
    badgeId: '',
  };
  generatedSecondaryId: string = '';
  savedFriendIds: string[] = [];

  activeTab: string = 'sajat_kihivasok';

  setActiveTab(tabName: string): void {
    this.activeTab = tabName;
  }

  onStatusChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.status = input.checked ? 1 : 0;
  }

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.auth.user$.subscribe((user) => {
      if (user) {
        this.id = user.id;
        this.fetchBadges();
        this.FriendRequest();
        this.user.id = user.id;
        this.fetchFriendProfilePicture();
      }
    });
  }

  addSelectedFriends(): void {
    this.selectedFriendIds.forEach((friendId) => {
      const friend = this.acceptedFriendRequests.find((req) => req.senderId.toString() === friendId);
      if (friend) {
        const friendName = this.senderNames[friend.senderId] || 'Ismeretlen felhasználó';
        const friendImage = friend.imageUrl || '/assets/images/profileKep.png';
    
        const alreadyAdded = this.addedFriends.some((f) => f.id === friendId);
        if (!alreadyAdded) {
          this.addedFriends.push({
            id: friend.senderId.toString(),
            name: friendName,
            imageUrl: friendImage
          });
        }
      }
    });
    
    this.selectedFriendIds = [];
  }

  removeFriend(friendId: string): void {
    this.addedFriends = this.addedFriends.filter((friend) => friend.id !== friendId);
  }

  onFriendSubmit(): void {
    if (!this.user_challenges.badgeId) {
      this.modalMessage = 'Kérjük, válassz egy jelvényt!';
      this.modalType = 'warning';
      this.modalVisible = true;
      return;
    }
  
    const secondaryId = localStorage.getItem('secondaryId');
    if (!secondaryId) {
      this.modalMessage = 'Hiányzik a secondaryId. Előbb hozz létre egy kihívást!';
      this.modalType = 'error';
      this.modalVisible = true;
      return;
    }
  
    const created = new Date(this.user_challenges.createdAt);
    const final = new Date(this.user_challenges.finalDate);
    const timeDiff = Math.abs(final.getTime() - created.getTime());
    const durationDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
    const newFriendsToAdd = this.addedFriends.filter(friend => !this.savedFriendIds.includes(friend.id));
  
    if (newFriendsToAdd.length === 0) {
      this.modalMessage = 'Nincs új barát a mentéshez!';
      this.modalType = 'info';
      this.modalVisible = true;
      this.autoCloseModal();
      return;
    }
  
    newFriendsToAdd.forEach((friend) => {
      const challengeData = {
        secondaryId: secondaryId,
        challengeName: this.user_challenges.challengeName,
        challengeDescription: this.user_challenges.challengeDescription,
        status: this.user_challenges.status,
        createdAt: this.user_challenges.createdAt,
        finalDate: this.user_challenges.finalDate,
        rewardPoints: this.user_challenges.rewardPoints,
        badgeId: this.user_challenges.badgeId,
        durationDays: durationDays,
        userId: friend.id,
      };
  
      this.http.post(`http://localhost:3000/challenges/challenge/friend/${friend.id}`, challengeData).subscribe({
        next: (response: any) => {
          console.log(`Kihívás sikeresen elküldve a felhasználónak: ${friend.id}`, response);
          this.savedFriendIds.push(friend.id); // csak sikeres mentés után tároljuk
        },
        error: (error) => {
          console.error(`Hiba történt a kihívás mentésekor a felhasználónál: ${friend.id}`, error);
        }
      });
    });
  
    this.modalMessage = 'Kihívás elküldve az új barát(ok)nak!';
    this.modalType = 'success';
    this.modalVisible = true;
    this.autoCloseModal();
  }

  onSubmit(): void {
    if (!this.user_challenges.badgeId) {
      this.modalMessage = 'Kérjük, válassz egy jelvényt!';
      this.modalType = 'warning';
      this.modalVisible = true;
      return;
    }
  
    const created = new Date(this.user_challenges.createdAt);
    const final = new Date(this.user_challenges.finalDate);
    const timeDiff = Math.abs(final.getTime() - created.getTime());
    const durationDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
    const challengeData = {
      secondaryId: this.user_challenges.secondaryId,
      challengeName: this.user_challenges.challengeName,
      challengeDescription: this.user_challenges.challengeDescription,
      status: this.user_challenges.status,
      createdAt: this.user_challenges.createdAt,
      finalDate: this.user_challenges.finalDate,
      rewardPoints: this.user_challenges.rewardPoints,
      badgeId: this.user_challenges.badgeId,
      durationDays: durationDays,
      userId: this.user.id,
    };
  
    this.http.post(`http://localhost:3000/challenges/challenge/${this.id}`, challengeData).subscribe({
      next: (response: any) => {
        this.modalMessage = response.message;
        this.modalType = 'success';
        this.modalVisible = true;
  
        if (response.user_challenges?.id) {
          this.user_challenges.id = response.user_challenges.id;
          localStorage.setItem('challengeId', this.user_challenges.id);
        }
  
        if (response.user_challenges?.secondaryId) {
          localStorage.setItem('secondaryId', response.user_challenges.secondaryId);
        }
  
        this.autoCloseModal();
      },
      error: (error) => {
        this.modalMessage = 'Hiba történt a kihívás mentésekor!';
        this.modalType = 'error';
        this.modalVisible = true;
        console.error(error);
        this.autoCloseModal();
      },
    });
  }

  fetchBadges(): void {
    const token = localStorage.getItem('trackit');
    if (!token) {
      console.error('No valid token found!');
      return;
    }

    this.http.get<{ badges: Badge[] }>('http://localhost:3000/challenges/all-badges').subscribe({
      next: (response) => {
        this.badges = response.badges.map((badge) => ({
          ...badge,
          imageUrl: `http://localhost:3000/uploads/${badge.filename}`,
        }));
      },
      error: (error) => {
        console.error('Error fetching badges:', error);
      },
    });
  }

  fetchFriendProfilePicture(): void {
    const token = localStorage.getItem('trackit');
    if (!token) {
        console.error('No valid token found!');
        return;
    }

    this.http
        .get<{ senderId: number; name: string; imageUrl: string | null }[]>(
            'http://localhost:3000/friends/friend-picture',
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        .subscribe({
            next: (response) => {
                response.forEach((friend) => {
                    this.senderNames[friend.senderId] = friend.name || 'Ismeretlen felhasználó';
                    const friendImage = friend.imageUrl || '/assets/images/profileKep.png';
                    this.showFriendRequests.forEach((request) => {
                        if (request.senderId === friend.senderId) {
                            request['imageUrl'] = friendImage;
                        }
                    });
                });
            },
            error: (error) => {
                console.error("Error fetching friends' profile pictures:", error);
            },
        });
  }

  FriendRequest() {
    this.api.readFriendRequests('friends', this.id).subscribe({
      next: (res: any) => {
        if (!res || res.friendRequests.length === 0) {
          console.warn('No user friend_requests found.');
          this.showFriendRequests = [];
          return;
        }
        this.showFriendRequests = res.friendRequests;

        this.showFriendRequests.forEach((request) => {
          this.api.getLoggedUser('users', request.senderId.toString()).subscribe((res: any) => {
            const user = res.user;
            this.senderNames[request.senderId] = user.name ?? 'Ismeretlen felhasználó';
          });
        });
      },
      error: (err) => {
        console.error('Error fetching user friend_requests:', err);
        this.showFriendRequests = [];
      },
    });
  }

  selectFriendRequest(friendRequest: Friend_Request): void {
    this.friend_requests = { ...friendRequest };
  }

  hasAcceptedFriends(): boolean {
    return this.showFriendRequests.some((request) => request.status === 'accepted');
  }

  get acceptedFriendRequests(): Friend_Request[] {
    return this.showFriendRequests.filter((fr) => fr.status === 'accepted');
  }

  openPopup(action: 'accept' | 'delete' | 'remove', id: string) {
    this.selectedFriendId = id;
    this.selectedAction = action;

    if (action === 'delete') {
      this.popupMessage = 'Biztosan elutasítod/törlöd ezt a felhasználót?';
    } else if (action === 'accept') {
      this.popupMessage = 'Biztosan megerősíti ezt a barátkérést?';
    } else if (action === 'remove') {
      this.popupMessage = 'Biztosan eltávolítod ezt a barátot a listádról?';
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
      } else if (this.selectedAction === 'remove') {
        this.removeFriend(this.selectedFriendId);
        this.modalMessage = 'A barát sikeresen eltávolítva a listából!';
        this.modalType = 'success';
        this.modalVisible = true;
        this.closePopup();
        this.autoCloseModal();
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
