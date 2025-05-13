import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { User_Challenge } from '../../interfaces/user_challenges';
import { CommonModule } from '@angular/common';
import * as bootstrap from 'bootstrap';
import { HttpClient } from '@angular/common/http';
import { Badge } from '../../interfaces/badges';

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
      private http: HttpClient
    ) {}

    user_challenges: User_Challenge[] = [];
    currentUserId: string | null = null;
    userNames: { [key: string]: string } = {};
    badges: { [key: string]: Badge } = {};
    allChallengesCompleted: boolean = false;
    hasAnyChallengeCompleted: boolean = false;

    activeTab: string = 'statisztika';
    totalPoints: number = 0;
    userRank: string = 'Újonc';
    nextRankPoints: number = 1000;
    highersRank: string = '';
    highestWeeklyPerformance: number = 0;

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
              this.allChallengesCompleted = this.user_challenges.every(challenge => challenge.completedAt != null);
              this.hasAnyChallengeCompleted = this.user_challenges.some(challenge => challenge.completedAt != null);
              this.calculatePointsAndRank();
              this.highestWeeklyPerformance = this.calculateWeeklyProgress(this.user_challenges);

            },
            error: (err) => {
              console.error('Error fetching user challenges:', err);
            }
          });
          this.Challenge();
        }
      });
    }

    ngAfterViewInit(): void {
      const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.forEach(tooltipTriggerEl => {
        new bootstrap.Tooltip(tooltipTriggerEl);
      });
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
                challenge.secondaryId = challenge.secondaryId || 'No secondary ID available';
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
      if (!this.hasAnyChallengeCompleted) {
        return 0;
      }

      return challenges
        .filter(challenge => challenge.completedAt) // csak a befejezett kihívások
        .reduce((acc, challenge) => acc + (challenge.rewardPoints || 0), 0);
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
      const pointsNeeded = this.nextRankPoints - currentRankPoints;
    
      if (pointsNeeded === 0) {
        return '100%';
      }
    
      const progress = ((this.totalPoints - currentRankPoints) / pointsNeeded) * 100;
      return `${Math.min(Math.max(progress, 0), 100)}%`;
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
    
    private calculateWeeklyProgress(challenges: User_Challenge[]): number {
    const currentDate = new Date();
    const weeklyChallenges = challenges.filter(challenge => {
      const createdAt = new Date(challenge.createdAt);
      const futureDate = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
      const completedAt = new Date(challenge.completedAt);

      if (futureDate < currentDate) {
        return false;
      }

      if (completedAt < createdAt) {
        challenge.progressPercentage = 0;
        return true;
      }

      const totalDays = 7;
      const daysCompleted = (completedAt.getTime() - createdAt.getTime()) / (1000 * 3600 * 24);
      challenge.progressPercentage = daysCompleted <= 1 ? 100 : Math.max(0, Math.min(100, ((totalDays - daysCompleted) / totalDays) * 100));
      return true;
    });

    const totalProgress = weeklyChallenges.reduce((acc, challenge) => acc + challenge.progressPercentage, 0);
    return weeklyChallenges.length > 0 ? totalProgress / weeklyChallenges.length : 0;
  }
}