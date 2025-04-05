import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { User } from '../../interfaces/user';
import { MessageService } from '../../services/message.service';
import { ProfileBaratComponent } from '../profile-barat/profile-barat.component';
import { ProfileBejegyzesComponent } from '../profile-bejegyzes/profile-bejegyzes.component';
import { ProfileJelvenyComponent } from '../profile-jelveny/profile-jelveny.component';
import { ProfileModositasComponent } from '../profile-modositas/profile-modositas.component';
import { ProfileStatComponent } from '../profile-stat/profile-stat.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ProfileBaratComponent, ProfileBejegyzesComponent, ProfileJelvenyComponent, ProfileModositasComponent, ProfileStatComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})

export class ProfileComponent implements OnInit {
  constructor(
    private api: ApiService,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private message: MessageService
  ) {}

  currentUserId: string | null = null;
  userNames: { [key: string]: string } = {};

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
      }
    });
  }
}