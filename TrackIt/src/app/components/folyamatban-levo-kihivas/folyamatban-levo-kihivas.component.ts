import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { User } from '../../interfaces/user';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { User_Challenge } from '../../interfaces/user_challenges';
import { Badge } from '../../interfaces/badges';
import { Friend_Request } from '../../interfaces/friend_requests';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-folyamatban-levo-kihivas',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertModalComponent],
  templateUrl: './folyamatban-levo-kihivas.component.html',
  styleUrl: './folyamatban-levo-kihivas.component.scss'
})
export class FolyamatbanLevoKihivasComponent implements OnInit, AfterViewInit {
  constructor(
    private api: ApiService,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private http: HttpClient
  ) {}

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
  showUser_challenges: User_Challenge[] = [];
  senderNames: { [key: string]: string } = {};
  activeTab: string = 'statisztika';
  challengeFriends: string[] = [];
  challengeFriendsMap: { [key: string]: string[] } = {};

  friend_requests: Friend_Request[] = [];
  showFriendRequests: Friend_Request[] = [];
  imagePreviewUrl: string | null = null;
  addedFriends: { id: string; name: string; imageUrl: string;}[] = [];

  popupMessage: string | null = null;
  showPopup: boolean = false;
  selectedChallengeId: string | null = null;
  selectedAction: 'delete' | null = null;

  modalVisible = false;
  modalType: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalMessage = '';
  invalidFields: string[] = [];
  
  badges: { [key: string]: Badge } = {};

  user: User = {
      id: '',
      name: '',
      email: '',
      password: '',
      role: '',
      pictureId: '',
      createdAt: '',
      confirm: ''
  };

  id: string = "";

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.auth.user$.subscribe(user => {
      if (user) {
        this.id = user.id;
        this.Challenge();
        this.loadChallengeFriends();
      }
    });
  }

  ngAfterViewInit(): void {
      const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
          tooltipTriggerList.forEach(tooltipTriggerEl => {
            new bootstrap.Tooltip(tooltipTriggerEl);
          });
  }

  finishChallnge(challenge: User_Challenge): void {
    const completedAt = new Date().toISOString();

    this.http.post(`http://localhost:3000/challenges/completedAt/${challenge.id}`, { completedAt }).subscribe({
      next: (response: any) => {
        this.modalMessage = response.message;
        this.modalType = 'success';
        this.modalVisible = true;
        this.autoCloseModal();

        setTimeout(() => {
          this.selectedChallengeId = challenge.id;
          this.selectedAction = 'delete';
          this.confirmAction();
        }, 7 * 24 * 60 * 60 * 1000);
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

  loadChallengeFriends(): void {
    this.api.readUserChallenges('user_statistics', this.id).subscribe({
      next: (res: any) => {
        const challenges = res?.user_challenges ?? res;
  
        if (!Array.isArray(challenges)) {
          console.warn('No challenges found or challenges are not in expected format');
          return;
        }
  
        const secondaryIds = [...new Set(challenges.map((c: any) => c.secondaryId))];
        if (secondaryIds.length === 0) {
          console.warn('No secondaryIds found.');
          return;
        }

        const requests = secondaryIds.map(id =>
          this.api.readChallengeParticipants('challenges', id)
        );
  
        forkJoin(requests).subscribe({
        next: (responses: any[]) => {
          responses.forEach((res: any) => {
            const names: string[] = Array.from(new Set(res.users || []));
            this.challengeFriendsMap[res.secondaryId] = names;
      });
    },
    error: (err) => {
      console.error('Error loading challenge participants:', err);
    }
  });
      },
      error: (err) => {
        console.error('Error fetching user challenges:', err);
      }
    });
  }
  
  get challengeIds(): string[] {
    return Object.keys(this.challengeFriendsMap);
  }

  PublicChallenge(): boolean {
    return this.showUser_challenges.some(request => request.status === 1);
  }

  PrivateChallenge(): boolean {
    return this.showUser_challenges.some(request => request.status === 0);
  }

  Challenge() {
    this.auth.user$.subscribe(user => {
      if (user) {
        this.id = user.id;

        this.api.readUserChallenges('user_statistics', user.id).subscribe({
          next: (res: any) => {
            const challenges = res?.user_challenges ?? res;
            if (!Array.isArray(challenges)) {
              console.warn('No user challenges found');
              this.showUser_challenges = [];
              return;
            }

            this.showUser_challenges = challenges;

            this.showUser_challenges.forEach(challenge => {
              if (challenge.id) {
                challenge.secondaryId = challenge.secondaryId || 'No secondary ID available';
                this.fetchBadge(challenge);
              }
            });

            this.showUser_challenges = this.showUser_challenges.filter((request: User_Challenge) =>
              request.status === 1 || request.status === 0
            );
          },
          error: (err) => {
            console.error('Error fetching user challenges:', err);
          }
        });
      }
    });
  }

  fetchBadge(challenge: User_Challenge): void {
    const token = localStorage.getItem('trackit');
    if (!token) {
        console.error('No valid token found!');
        return;
    }

    this.http
        .get<{ imageUrl: string | null }>('http://localhost:3000/challenges/badge', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                id: challenge.id,
            },
        })
        .subscribe({
            next: (response) => {
                challenge.imagePreviewUrl = response.imageUrl ?? undefined; 
            },
            error: (error) => {
                console.error('Error fetching badge:', error);
            },
        });
  }

  setActiveTab(tabName: string) {
    this.activeTab = tabName;
  }

  openPopup(action: 'delete', id: string) {
    this.selectedChallengeId = id;
    this.selectedAction = action;

    if (action === 'delete') {
      this.popupMessage = 'Biztosan törlöd ezt a kihívást?';
    }

    this.showPopup = true;
  }

  confirmAction() {
    if (this.selectedChallengeId && this.selectedAction) {
      if(this.selectedAction === 'delete')
        this.http.delete<{ message: string }>(`http://localhost:3000/challenges/${this.selectedChallengeId}`).subscribe({
        next: (response) => {
          switch (response.message) {
            case 'Feladat sikeresen törölve!':
              this.modalMessage = 'A kihívás sikeresen törölve lett!';
              this.modalType = 'success';
              break;
            case 'Feladat nem található!':
              this.modalMessage = 'A kihívás nem található.';
              this.modalType = 'error';
              break;
            default:
              this.modalMessage = 'Ismeretlen válasz érkezett a szervertől.';
              this.modalType = 'warning';
          }
  
          this.modalVisible = true;
          this.Challenge();
          this.closePopup();
          this.autoCloseModal();
        },
        error: (error) => {
          console.error('Hiba a törlés során:', error);
          this.modalMessage = 'Szerverhiba történt a törlés közben.';
          this.modalType = 'error';
          this.modalVisible = true;
          this.closePopup();
          this.autoCloseModal();
        }
      });
    }
  }

  closePopup() {
    this.showPopup = false;
    this.popupMessage = null;
    this.selectedChallengeId = null;
    this.selectedAction = null;
  }

  autoCloseModal() {
    setTimeout(() => {
      this.modalVisible = false;
    }, 5000);
  }
}