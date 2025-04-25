import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Badge } from '../../interfaces/badges';
import { Friend_Request } from '../../interfaces/friend_requests';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute } from '@angular/router';
import { User_Challenge } from '../../interfaces/user_challenges';

@Component({
  selector: 'app-challenge',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertModalComponent, MatInputModule, MatSelectModule, MatFormFieldModule],
  templateUrl: './challenge.component.html',
  styleUrl: './challenge.component.scss',
})
export class ChallengeComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private api: ApiService
  ) {}

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
  selectedBadgeId: string | null = null;
  friend_requests: Friend_Request[] = [];
  challengeFriends: Friend_Request[] = [];
  popupMessage: string | null = null;
  showPopup: boolean = false;
  selectedFriendId: string | null = null;
  selectedAction: 'accept' | 'delete' | 'remove' | null = null;
  senderNames: { [key: string]: string } = {};
  modalVisible = false;
  modalType: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalMessage = '';
  invalidFields: string[] = [];
  imagePreviewUrl: string | null = null;

  user_challenges: User_Challenge = {
    id: '',
    userId: 0,
    progressPercentage: 0,
    createdAt: '',
    completedAt: '',
    status: false,
    durationDays: 0,
    rewardPoints: 0,
    finalDate: '',
    challengeName: '',
    challengeDescription: '',
    badgeId: '',
  };

  status: number = 0;
  selectedFriendIds: string[] = [];
  addedFriends: { id: string; name: string; imageUrl: string; activeChallenge: { id: string } }[] = [];
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

  onActiveChallengeChange(friend_requests: Friend_Request): void {
    if (friend_requests.activeChallenge) {
      const updatedData = {
        activeChallengeId: this.user_challenges?.id,
      };

      this.http
        .patch(`http://localhost:3000/friends/update-active-challenge/${friend_requests.id}`, updatedData)
        .subscribe({
          next: (response: any) => {
            this.modalMessage = response.message;
            this.modalType = 'success';
            this.modalVisible = true;
          },
          error: (error) => {
            console.error('Hiba az activeChallenge frissítésekor:', error);
            this.modalMessage = 'Hiba történt az aktív kihívás frissítése közben!';
            this.modalType = 'error';
            this.modalVisible = true;
          },
        });
    }
  }

  addSelectedFriends(): void {
    this.selectedFriendIds.forEach((friendId) => {
      const friend = this.acceptedFriendRequests.find((req) => req.senderId.toString() === friendId);
      if (friend) {
        const friendName = this.senderNames[friend.senderId] || 'Ismeretlen felhasználó';
        const friendImage = this.imagePreviewUrl || '/assets/images/default-profile.png';

        const alreadyAdded = this.addedFriends.some((f) => f.id === friendId);
        if (!alreadyAdded) {
          this.addedFriends.push({
            id: friendId,
            name: friendName,
            imageUrl: friendImage,
            activeChallenge: { id: this.user_challenges.id || 'default-challenge-id' },
          });
        }
      }
    });

    this.selectedFriendIds = [];
  }

  removeFriend(friendId: string): void {
    this.addedFriends = this.addedFriends.filter((friend) => friend.id !== friendId);
  }

  saveActiveChallenge(): void {
    const updateRequests = this.addedFriends.map((friend) => {
      // Log the friend data to the console
      console.log('Frissítendő user adatai:', {
        friendId: friend.id,
        friendName: friend.name,
        activeChallengeId: friend.activeChallenge?.id || null,
      });
  
      return this.http
        .patch(`http://localhost:3000/friends/update-active-challenge/${friend.id}`, {
          activeChallengeId: friend.activeChallenge?.id || null,
        })
        .toPromise();
    });
  
    Promise.all(updateRequests)
      .then(() => {
        this.modalMessage = 'Barátok aktív kihívásai sikeresen frissítve az adatbázisban!';
        this.modalType = 'success';
        this.modalVisible = true;
        this.autoCloseModal();
      })
      .catch((error) => {
        console.error('Hiba az activeChallenge frissítése során:', error);
        this.modalMessage = 'Hiba történt a kihívások frissítése közben!';
        this.modalType = 'error';
        this.modalVisible = true;
      });
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
      challengeName: this.user_challenges.challengeName,
      challengeDescription: this.user_challenges.challengeDescription,
      status: this.user_challenges.status,
      createdAt: this.user_challenges.createdAt,
      finalDate: this.user_challenges.finalDate,
      rewardPoints: this.user_challenges.rewardPoints,
      badgeId: this.user_challenges.badgeId,
      durationDays: durationDays,
      friendIds: this.selectedFriendIds,
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
      .get<{ imageUrl: string | null }>('http://localhost:3000/friends/friend-picture', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .subscribe({
        next: (response) => {
          this.imagePreviewUrl = response.imageUrl || '/assets/images/profileKep.png';
        },
        error: (error) => {
          console.error("Error fetching friend's profile picture:", error);
          this.imagePreviewUrl = '/assets/images/profileKep.png';
        },
      });
  }

  FriendRequest() {
    this.api.readFriendRequests('friends', this.id).subscribe({
      next: (res: any) => {
        if (!res || res.friendRequests.length === 0) {
          console.warn('No user friend_requests found.');
          this.friend_requests = [];
          return;
        }

        this.friend_requests = res.friendRequests.filter((request: Friend_Request) => request.activeChallenge !== null);

        this.friend_requests.forEach((request) => {
          this.api.getLoggedUser('users', request.senderId.toString()).subscribe((res: any) => {
            const user = res.user;
            this.senderNames[request.senderId] = user.name ?? 'Ismeretlen felhasználó';
          });
        });
      },
      error: (err) => {
        console.error('Error fetching user friend_requests:', err);
        this.friend_requests = [];
      },
    });
  }

  hasAcceptedFriends(): boolean {
    return this.friend_requests.some((request) => request.status === 'accepted');
  }

  get acceptedFriendRequests(): Friend_Request[] {
    return this.friend_requests.filter((fr) => fr.status === 'accepted');
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