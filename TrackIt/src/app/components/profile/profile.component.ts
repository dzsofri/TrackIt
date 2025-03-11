import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { User_statistics } from '../../interfaces/user_statistics';
import { Habit } from '../../interfaces/habits';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { User_Challenge } from '../../interfaces/user_challenges';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  constructor(
    private api: ApiService,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute
  ) {}

  userID: string = "";
  user_statistics: User_statistics | null = null;
  habits: Habit[] = [];
  user_challenges: User_Challenge[] = [];
  totalProgressPercentage: number = 0;
  weeklyProgressPercentage: number = 0;
  monthlyProgressPercentage: number = 0;
  activeTab: string = 'statisztika';

  ngOnInit(): void {
    this.userID = this.activatedRoute.snapshot.params['userID'];

    this.auth.user$.subscribe(user => {
      if (user) {
        this.userID = user.id;
        this.api.readUserStatistics('user_statistics', this.userID).subscribe({
          next: (res: any) => {
            if (!res || res.length === 0) {
              console.warn('No user statistics found.');
              return;
            }
            this.user_statistics = this.sumUserStatistics(res);
          },
          error: (err) => {
            console.error('Error fetching user statistics:', err);
          }
        });

        this.api.readUserHabits('user_statistics', this.userID).subscribe({
          next: (res: any) => {
            if (!res || res.length === 0) {
              console.warn('No user habits found.');
              return;
            }
            this.habits = res;
          },
          error: (err) => {
            console.error('Error fetching user habits:', err);
          }
        });

        this.api.readUserChallenges('user_statistics', this.userID).subscribe({
          next: (res: any) => {
            if (!res || res.length === 0) {
              console.warn('No user challenges found.');
              return;
            }
            this.user_challenges = res;
            this.totalProgressPercentage = Math.round(this.user_challenges.reduce((acc, challenge) => acc + challenge.progressPercentage, 0));
            this.weeklyProgressPercentage = Math.round(this.calculateWeeklyProgress(this.user_challenges));
            this.monthlyProgressPercentage = Math.round(this.calculateMonthlyProgress(this.user_challenges));
          },
          error: (err) => {
            console.error('Error fetching user challenges:', err);
          }
        });
      }
    });
  }

  setActiveTab(tabName: string) {
    this.activeTab = tabName;
  }

  isPasswordVisible = false;

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  private sumUserStatistics(statistics: User_statistics[]): User_statistics {
    const summedStatistics = statistics.reduce((acc, curr) => {
      acc.completedTasks += curr.completedTasks;
      acc.missedTasks += curr.missedTasks;
      return acc;
    }, {
      id: '',
      userId: 0,
      completedTasks: 0,
      missedTasks: 0,
      completionRate: 0,
      activeChallengeId: '',
      activeTaskId: ''
    });

    const totalTasks = summedStatistics.completedTasks + summedStatistics.missedTasks;
    summedStatistics.completionRate = totalTasks > 0 ? Math.ceil((summedStatistics.completedTasks / totalTasks) * 100) : 0;

    return summedStatistics;
  }
  
  getCompletedDays(user_challenge: User_Challenge): number {
    const createdAt = new Date(user_challenge.createdAt);
    const completedAt = user_challenge.completedAt ? new Date(user_challenge.completedAt) : new Date();
    const finalDate = user_challenge.finalDate ? new Date(user_challenge.finalDate) : null;
    
    const endDate = finalDate && finalDate < completedAt ? finalDate : completedAt;
    
    const timeDiff = Math.abs(endDate.getTime() - createdAt.getTime());
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return Math.min(diffDays, user_challenge.durationDays);
  }

  private calculateWeeklyProgress(challenges: User_Challenge[]): number {
    const currentDate = new Date();
    const weeklyChallenges = challenges.filter(challenge => {
      const createdAt = new Date(challenge.createdAt);
      const diffDays = Math.ceil((currentDate.getTime() - createdAt.getTime()) / (1000 * 3600 * 24));
      return diffDays <= 7;
    });

    const totalProgress = weeklyChallenges.reduce((acc, challenge) => acc + challenge.progressPercentage, 0);
    return weeklyChallenges.length > 0 ? totalProgress / weeklyChallenges.length : 0;
  }

  private calculateMonthlyProgress(challenges: User_Challenge[]): number {
    const currentDate = new Date();
    const monthlyChallenges = challenges.filter(challenge => {
      const createdAt = new Date(challenge.createdAt);
      const diffDays = Math.ceil((currentDate.getTime() - createdAt.getTime()) / (1000 * 3600 * 24));
      return diffDays <= 30;
    });

    const totalProgress = monthlyChallenges.reduce((acc, challenge) => acc + challenge.progressPercentage, 0);
    return monthlyChallenges.length > 0 ? totalProgress / monthlyChallenges.length : 0;
  }
}