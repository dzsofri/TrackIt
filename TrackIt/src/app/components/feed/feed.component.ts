import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ProfileBejegyzesComponent } from '../profile-bejegyzes/profile-bejegyzes.component';
import { NewpostComponent } from '../newpost/newpost.component';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { ReminderService } from '../../services/reminder.service';
import { User } from '../../interfaces/user';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProfileBejegyzesComponent,
    NewpostComponent,
    AlertModalComponent
  ],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {
  posts: any[] = []; // A posztok tárolása

  constructor(
    private apiService: ApiService,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private reminderService: ReminderService
  ) {}

  modalVisible = false;
  modalType: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalMessage = '';
  invalidFields: string[] = [];
  reminderMessage: string | null = null;
  modalButtons: { label: string, action: () => void, class?: string }[] = [];

  currentUserId: string | null = null;
  userNames: { [key: string]: string } = {};

  id: string = '';

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

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.auth.user$.subscribe(user => {
      if (user) {
        this.id = user.id;
        this.apiService.getLoggedUser('users', this.id).subscribe({
          next: (res: any) => {
            this.user = res.user;
            if (this.user && this.user.id) {
              this.userNames[this.user.id] = this.user.name ?? 'Ismeretlen felhasználó';
            }
          },
          error: (err) => {
            console.error('Error fetching user data:', err);
          }
        });
      }
    });

    this.loadPosts();

    this.reminderService.reminder$.subscribe(message => {
      if (message) {
        this.showReminderModal(message);
      }
    });
  }

  loadPosts() {
    this.apiService.getPosts().subscribe(
      response => {
        this.posts = response.posts || [];
      },
      error => {
        console.error('Hiba a posztok betöltésekor:', error);
      }
    );
  }

  showReminderModal(reminderMessage: string) {
    this.modalMessage = reminderMessage;
    this.modalType = 'info';
    this.modalButtons = [
      {
        label: 'OK',
        action: () => {
          this.onModalClose();
        },
        class: 'btn-primary'
      }
    ];
    this.modalVisible = true;
  }

  onModalClose() {
    this.modalVisible = false;
    this.reminderService.clearReminder();
  }
}
