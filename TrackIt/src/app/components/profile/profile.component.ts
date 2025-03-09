import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { User_statistics } from '../../interfaces/user_statistics';
import { Habit } from '../../interfaces/habits';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';

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
}