import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User_Challenge } from '../../interfaces/user_challenges';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-publikus-kihivasok',
  standalone: true,
  imports: [CommonModule, AlertModalComponent],
  templateUrl: './publikus-kihivasok.component.html',
  styleUrl: './publikus-kihivasok.component.scss'
})
export class PublikusKihivasokComponent implements OnInit, AfterViewInit {
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

  popupMessage: string | null = null;
  showPopup: boolean = false;
  selectedChallengeId: string | null = null;
  selectedAction: 'delete' | null = null;

  modalVisible = false;
  modalType: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalMessage = '';
  invalidFields: string[] = [];

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
  id: string = "";
  activeTab: string = 'statisztika';

  ngOnInit(): void {
      this.id = this.activatedRoute.snapshot.params['id'];
      this.auth.user$.subscribe(user => {
        if (user) {
          this.id = user.id;
          this.loadAllChallenges();
        }
      });
  }

  ngAfterViewInit(): void {
        const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.forEach(tooltipTriggerEl => {
          new bootstrap.Tooltip(tooltipTriggerEl);
        });
      }

  takeChallenge(challenge: User_Challenge): void {
    const challengeData = {
      userId: this.id,
      secondaryId: challenge.secondaryId,
      challengeName: challenge.challengeName,
      challengeDescription: challenge.challengeDescription,
      status: 1,
      createdAt: challenge.createdAt,
      finalDate: challenge.finalDate,
      rewardPoints: challenge.rewardPoints,
      badgeId: challenge.badgeId,
      durationDays: challenge.durationDays,
      completedAt: null,
    };

    console.log('Beküldött challengeData:', challengeData);

    this.http.post(`http://localhost:3000/challenges/fromPublic`, challengeData).subscribe({
      next: (response) => {
        console.log('Kihívás sikeresen felvéve:', response);
        this.modalMessage = 'Sikeresen felvetted a kihívást!';
        this.modalType = 'success';
        this.modalVisible = true;
        this.autoCloseModal();
      },
      error: (err) => {
        console.error('Hiba a kihívás felvételekor:', err);
        this.modalMessage = 'Hiba történt a kihívás felvételekor.';
        this.modalType = 'error';
        this.modalVisible = true;
        this.autoCloseModal();
      }
    });
  }

  loadAllChallenges(): void {
    const today = new Date().toISOString().split('T')[0];

    this.http.get<{ challenges: User_Challenge[] }>('http://localhost:3000/challenges/all').subscribe({
      next: (response) => {
        const filteredChallenges = response.challenges.filter(
          (challenge) => challenge.status === 1 && String(challenge.userId) !== this.id && today
        );

        this.showUser_challenges = filteredChallenges;
        
        this.showUser_challenges.forEach(challenge => this.fetchBadge(challenge));
      },
      error: (error) => {
        console.error('Hiba a kihívások lekérésekor:', error);
        this.modalMessage = 'Nem sikerült betölteni a kihívásokat.';
        this.modalType = 'error';
        this.modalVisible = true;
        this.autoCloseModal();
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
