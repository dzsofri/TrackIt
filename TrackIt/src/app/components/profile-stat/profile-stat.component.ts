import { Component } from '@angular/core';
import { User_Challenge } from '../../interfaces/user_challenges';
import { User_statistics } from '../../interfaces/user_statistics';
import { User } from '../../interfaces/user';
import { Habit } from '../../interfaces/habits';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../services/message.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-stat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-stat.component.html',
  styleUrl: './profile-stat.component.scss'
})
export class ProfileStatComponent {
  constructor(
    private api: ApiService,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private message: MessageService
  ) {}

  // Interfaces
  user_statistics: User_statistics | null = null;
  habits: Habit[] = [];
  user_challenges: User_Challenge[] = [];
  currentUserId: string | null = null;
  userNames: { [key: string]: string } = {};

  // Default user
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

  activeTab: string = 'statisztika';
  setActiveTab(tabName: string) {
    this.activeTab = tabName;
  }

  id: string = "";
  totalProgressPercentage: number = 0;
  weeklyProgressPercentage: number = 0;
  monthlyProgressPercentage: number = 0;
  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.auth.user$.subscribe(user => {
      if (user) {
        this.id = user.id;
        this.api.readUserStatistics('user_statistics', this.id).subscribe({
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

        this.api.readUserHabits('user_statistics', this.id).subscribe({
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

        this.api.readUserChallenges('user_statistics', this.id).subscribe({
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
  
  getCompletedDays(user_challenge: User_Challenge): string {
    const createdAt = new Date(user_challenge.createdAt);
    const completedAt = user_challenge.completedAt ? new Date(user_challenge.completedAt) : new Date();
    if (completedAt < createdAt) {
      return 'nincs feladat teljesítve';
    }
    const finalDate = user_challenge.finalDate ? new Date(user_challenge.finalDate) : null;
   
    const endDate = finalDate && finalDate < completedAt ? finalDate : completedAt;
   
    const timeDiff = Math.abs(endDate.getTime() - createdAt.getTime());
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
   
    return `${Math.min(diffDays, user_challenge.durationDays)} nap alatt teljesítve`;
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

  private calculateMonthlyProgress(challenges: User_Challenge[]): number {
    const currentDate = new Date();
    const monthlyChallenges = challenges.filter(challenge => {
      const createdAt = new Date(challenge.createdAt);
      const futureDate = new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);
      const completedAt = new Date(challenge.completedAt);

      if (futureDate < currentDate) {
        return false;
      }

      if (completedAt < createdAt) {
        challenge.progressPercentage = 0;
        return true;
      }

      const totalDays = 30;
      const daysCompleted = (completedAt.getTime() - createdAt.getTime()) / (1000 * 3600 * 24);
      challenge.progressPercentage = daysCompleted <= 1 ? 100 : Math.max(0, Math.min(100, ((totalDays - daysCompleted) / totalDays) * 100));
      return true;
    });

    const totalProgress = monthlyChallenges.reduce((acc, challenge) => acc + challenge.progressPercentage, 0);
    return monthlyChallenges.length > 0 ? totalProgress / monthlyChallenges.length : 0;
  }
}