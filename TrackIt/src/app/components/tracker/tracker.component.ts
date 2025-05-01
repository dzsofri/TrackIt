import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../services/message.service';
import { HttpClient } from '@angular/common/http';
import { WatertrackerComponent } from '../watertracker/watertracker.component';
import { SleeptrackerComponent } from '../sleeptracker/sleeptracker.component';
import { CustomtrackerComponent } from '../customtracker/customtracker.component';
import { GymtrackerComponent } from '../gymtracker/gymtracker.component';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';

@Component({
  selector: 'app-tracker',
  imports: [CommonModule, FormsModule, WatertrackerComponent, SleeptrackerComponent, CustomtrackerComponent, GymtrackerComponent, AlertModalComponent],
  templateUrl: './tracker.component.html',
  styleUrl: './tracker.component.scss'
})
export class TrackerComponent {
  constructor(
    private api: ApiService,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private message: MessageService,
    private http: HttpClient
  ) {}

  id: string = "";

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
        this.user.id = user.id;
        this.fetchUserProfilePicture();
      }
    });
  }

  fetchUserProfilePicture(): void {
    const token = localStorage.getItem('trackit');
    if (!token) {
        console.error('No valid token found!');
        return;
    }

    this.http
        .get<{ imageUrl: string | null }>('http://localhost:3000/users/profile-picture', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .subscribe({
            next: (response) => {
                this.imagePreviewUrl = response.imageUrl || '/assets/images/profileKep.png';
            },
            error: (error) => {
                console.error('Error fetching profile picture:', error);
                this.imagePreviewUrl = '/assets/images/profileKep.png';
            },
        });
  }
  
  
  activeTab: string = 'watertracker'; // alapértelmezett aktív tab
  modalVisible = false;
  modalType: 'error' | 'success' | 'warning' | 'info' = 'info';
  modalMessage = '';

  imagePreviewUrl = 'path-to-image.jpg'; // ha kellene alapértelmezett kép
  user: any; // típus pontosítása később
  userNames: any = {}; // pl. objektum formában felhasználónevek
  
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
