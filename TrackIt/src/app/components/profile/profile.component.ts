import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { User_statistics } from '../../interfaces/user_statistics';
import { Habit } from '../../interfaces/habits';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { User_Challenge } from '../../interfaces/user_challenges';
import { FormsModule } from '@angular/forms';
import { User } from '../../interfaces/user';
import { Friend_Request } from '../../interfaces/friend_requests';
import { MessageService } from '../../services/message.service';
import * as bootstrap from 'bootstrap';
@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, AfterViewInit {
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
  friend_requests: Friend_Request[] = [];
  senderNames: { [key: string]: string } = {}; // To store sender names
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
  // Tabs
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
        this.api.getLoggedUser('users', this.id).subscribe({
          next: (res: any) => {
            this.user = res.user;
            if (this.user && this.user.id) {
              this.userNames[this.user.id] = this.user.name ?? 'Ismeretlen felhasználó';
              //console.log('User fetched:', this.user);
              //console.log('User names:', this.userNames);
            }
          },
          error: (err) => {
            console.error('Error fetching user data:', err);
          }
        });
        // Statisztika Tab
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
        // Barátok Tab
        this.FriendRequest();
      }
    });
  }
  ngAfterViewInit(): void {
    const popoverTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.forEach(popoverTriggerEl => {
      new bootstrap.Popover(popoverTriggerEl);
    });
  }
  FriendRequest(){
    this.api.readFriendRequests('friends', this.id).subscribe({
      next: (res: any) => {
        if (!res || res.friendRequests.length === 0) {
            console.warn('No user friend_requests found.');
            this.friend_requests = [];
            return;
        }
        this.friend_requests = res.friendRequests.filter((request: Friend_Request) =>
          request.status === 'pending' || request.status === 'accepted'
        );
        this.friend_requests.forEach(request => {
          this.api.getLoggedUser('users', request.senderId.toString()).subscribe((res: any) => {
              const user = res.user;
              this.senderNames[request.senderId] = user.name ?? 'Ismeretlen felhasználó';
          });
        });
      },
      error: (err) => {
          console.error('Error fetching user friend_requests:', err);
          this.friend_requests = [];
      }
    });
  }
  hasAcceptedFriends(): boolean {
    return this.friend_requests.some(request => request.status === 'accepted');
  }
  hasPendingFriends(): boolean {
    return this.friend_requests.some(request => request.status === 'pending');
  }
  deleteFriend(id: string) {
    if (confirm('Biztosan elutasítod/törlöd a barátkérést?')) {
      this.api.deleteFriendRequest('friends', id).subscribe(
        (res: any) => {
          this.message.showMessage('OK', 'A barátkérés elutasítva és törölve lett!', 'success');
          this.FriendRequest();
          setTimeout(() => {
            if (this.friend_requests.length === 0) {
              this.message.showMessage('Info', 'Jelenleg nincs követési kérésed!', 'info');
            }
          }, 100);
        },
        (error: any) => {
          this.message.showMessage('Hiba', 'A barátkérés nem található.', 'error');
        }
      );
    }
  }
  acceptFriend(id: string) {
    if (confirm('Biztosan megerősíti ezt a barátkérést?')) {
      this.api.acceptFriendRequest('friends', id).subscribe(
        (res: any) => {
          this.message.showMessage('OK', 'A barátkérés megerősítve!', 'success');
          this.FriendRequest();
          setTimeout(() => {
            if (this.friend_requests.length === 0) {
              this.message.showMessage('Info', 'Jelenleg nincs követési kérésed!', 'info');
            }
          }, 100);
        },
        (error: any) => {
          this.message.showMessage('Hiba', 'A barátkérés nem található.', 'error');
        }
      );
    }
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
      const futureDate = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
      const completedAt = new Date(challenge.completedAt);
      if (completedAt <= futureDate) {
        const totalDays = (futureDate.getTime() - createdAt.getTime()) / (1000 * 3600 * 24);
        const daysCompleted = (completedAt.getTime() - createdAt.getTime()) / (1000 * 3600 * 24);
        challenge.progressPercentage = (daysCompleted / totalDays) * 100;
        return true;
      }
      return false;
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
      if (completedAt <= futureDate) {
        const totalDays = (futureDate.getTime() - createdAt.getTime()) / (1000 * 3600 * 24);
        const daysCompleted = (completedAt.getTime() - createdAt.getTime()) / (1000 * 3600 * 24);
        challenge.progressPercentage = (daysCompleted / totalDays) * 100;
        return true;
      }
      return false;
    });
    const totalProgress = monthlyChallenges.reduce((acc, challenge) => acc + challenge.progressPercentage, 0);
    return monthlyChallenges.length > 0 ? totalProgress / monthlyChallenges.length : 0;
  }
  invalidFields: string[] = [];
  isPasswordVisible = false;
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}