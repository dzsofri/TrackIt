import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../services/message.service';
import { User_Challenge } from '../../interfaces/user_challenges';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-jelveny',
  imports: [CommonModule],
  templateUrl: './profile-jelveny.component.html',
  styleUrl: './profile-jelveny.component.scss'
})
export class ProfileJelvenyComponent {
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
            },
            error: (err) => {
              console.error('Error fetching user challenges:', err);
            }
          });
        }
      });
    }

    /*
    ngAfterViewInit(): void {
      const popoverTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="popover"]'));
      popoverTriggerList.forEach(popoverTriggerEl => {
        new bootstrap.Popover(popoverTriggerEl);
      });
    }
    */
}
