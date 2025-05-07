import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { User } from '../../interfaces/user';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { User_Challenge } from '../../interfaces/user_challenges';
import { Badge } from '../../interfaces/badges';

@Component({
  selector: 'app-folyamatban-levo-kihivas',
  standalone: true,
  imports: [CommonModule, AlertModalComponent],
  templateUrl: './folyamatban-levo-kihivas.component.html',
  styleUrl: './folyamatban-levo-kihivas.component.scss'
})
export class FolyamatbanLevoKihivasComponent {
  constructor(
    private api: ApiService,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private http: HttpClient
  ) {}

  user_challenges: User_Challenge[] = [];
  selectedChallengeDetails: User_Challenge | null = null;
  senderNames: { [key: string]: string } = {};
  activeTab: string = 'statisztika';

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
      }
    });
  }

  PublicChallenge(): boolean {
    return this.user_challenges.some(request => request.status === 1);
  }

  PrivateChallenge(): boolean {
    return this.user_challenges.some(request => request.status === 0);
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
              this.user_challenges = [];
              return;
            }

            this.user_challenges = challenges;

            this.user_challenges.forEach(challenge => {
              if (challenge.id) {
                this.fetchBadge(challenge);
              }
            });

            this.user_challenges = this.user_challenges.filter((request: User_Challenge) =>
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

  showChallengeDetails(challenge: User_Challenge) {
    this.selectedChallengeDetails = challenge;
  }
  
  closeDetailsPopup() {
    this.selectedChallengeDetails = null;
  }

  autoCloseModal() {
    setTimeout(() => {
      this.modalVisible = false;
    }, 5000);
  }
}