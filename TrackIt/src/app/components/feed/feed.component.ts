import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
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
    @ViewChild(ProfileBejegyzesComponent) profileComponent!: ProfileBejegyzesComponent;
  posts: any[] = [];

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

  // --- Poszt szerkesztéshez szükséges új mezők ---
  selectedPost: any = null;
  editModalVisible: boolean = false;

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
onPostSubmitted() {
  this.loadPosts();
  this.profileComponent?.loadAllPosts?.(); // Csak ha a metódus létezik
}

  // === 💬 POSZT SZERKESZTÉS LOGIKA ===

  editPost(post: any) {
    this.selectedPost = post;
    this.editModalVisible = true;
  }

  handleModalClose() {
    this.editModalVisible = false;
    this.selectedPost = null;
  }

  handlePostUpdate(updatedPost: any) {
    const index = this.posts.findIndex(p => p.id === updatedPost.id);
    if (index !== -1) {
      this.posts[index] = updatedPost;
    }
      this.loadPosts();
  }
}
