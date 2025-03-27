import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../services/message.service';
import { User_Challenge } from '../../interfaces/user_challenges';
import { CommonModule } from '@angular/common';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-profile-jelveny',
  imports: [CommonModule],
  templateUrl: './profile-jelveny.component.html',
  styleUrl: './profile-jelveny.component.scss'
})
export class ProfileJelvenyComponent implements OnInit, AfterViewInit {
  constructor(
      private api: ApiService,
      private auth: AuthService,
      private activatedRoute: ActivatedRoute,
      private message: MessageService
    ) {}

    user_challenges: User_Challenge[] = [];
    currentUserId: string | null = null;
    userNames: { [key: string]: string } = {};

    activeTab: string = 'statisztika';
    totalPoints: number = 0;
    userRank: string = 'Újonc';
    nextRankPoints: number = 1000;
    highersRank: string = '';

    setActiveTab(tabName: string) {
      this.activeTab = tabName;
    }

    id: string = "";

    ngOnInit(): void {
      this.id = this.activatedRoute.snapshot.params['id'];
      this.auth.user$.subscribe(user => {
        if (user) {
          this.id = user.id;
          this.api.readUserChallenges('user_statistics', this.id).subscribe({
            next: (res: any) => {
              if (!res || res.length === 0) {
                console.warn('No user challenges found.');
                return;
              }
              this.user_challenges = res;
              this.calculatePointsAndRank();
            },
            error: (err) => {
              console.error('Error fetching user challenges:', err);
            }
          });
        }
      });
    }

    ngAfterViewInit(): void {
      const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.forEach(tooltipTriggerEl => {
        new bootstrap.Tooltip(tooltipTriggerEl);
      });
    }

    private calculatePointsAndRank(): void {
      this.totalPoints = this.calculateTotalPoints(this.user_challenges);
      const rankInfo = this.calculateUserRank(this.totalPoints);
      this.userRank = rankInfo.rank;
      this.nextRankPoints = rankInfo.nextRankPoints;

      if (this.totalPoints >= 20000) {
        this.highersRank = 'Gratulálunk! Elérted a legmagasabb rangot!';
      }
    }
  
    private calculateTotalPoints(challenges: User_Challenge[]): number {
      return challenges.reduce((acc, challenge) => acc + (challenge.rewardPoints || 0), 0);
    }
  
    private calculateUserRank(points: number): { rank: string, nextRankPoints: number } {
      if (points >= 20000) {
        return { rank: 'Legenda', nextRankPoints: 20000 };
      } else if (points >= 15000) {
        return { rank: 'Mester', nextRankPoints: 20000 };
      } else if (points >= 10000) {
        return { rank: 'Szuper', nextRankPoints: 15000 };
      } else if (points >= 6000) {
        return { rank: 'Bajnok', nextRankPoints: 10000 };
      } else if (points >= 3000) {
        return { rank: 'Harcos', nextRankPoints: 6000 };
      } else if (points >= 1000) {
        return { rank: 'Felfedező', nextRankPoints: 3000 };
      } else {
        return { rank: 'Újonc', nextRankPoints: 1000 };
      }
    }

    getProgressBarWidth(): string {
      const currentRankPoints = this.getCurrentRankPoints(this.userRank);
      const progress = ((this.totalPoints - currentRankPoints) / (this.nextRankPoints - currentRankPoints)) * 100;
      return `${progress}%`;
    }

    private getCurrentRankPoints(rank: string): number {
      switch (rank) {
        case 'Legenda':
          return 20000;
        case 'Mester':
          return 15000;
        case 'Szuper':
          return 10000;
        case 'Bajnok':
          return 6000;
        case 'Harcos':
          return 3000;
        case 'Felfedező':
          return 1000;
        default:
          return 0;
      }
    }
}