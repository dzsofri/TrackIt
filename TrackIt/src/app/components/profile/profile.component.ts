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
import { HttpClient } from '@angular/common/http';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ProfileBaratComponent, ProfileBejegyzesComponent, ProfileJelvenyComponent, ProfileModositasComponent, ProfileStatComponent, AlertModalComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})

export class ProfileComponent implements OnInit {
  constructor(
    private api: ApiService,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private message: MessageService,
    private http: HttpClient
  ) {}

  modalVisible = false;
  modalType: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalMessage = '';
  invalidFields: string[] = [];

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

  selectedFile: File | null = null;
  selectedFileName: string | null = null;
  imagePreviewUrl: string | null = null;

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
        this.fetchUserProfilePicture(this.user.id);
      }
    });
  }

  fetchUserProfilePicture(userid: any): void {
    const token = localStorage.getItem('trackit');
    if (!token) {
      console.error('No valid token found!');
      return;
    }
    console.log(userid)
    console.log(token)

    this.http
      .get<{ imageUrl: string | null }>(`http://localhost:3000/users/profile-picture/${userid}`, {
        headers: { Authorization: `Bearer ${token}` },
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
  onFileSelectedAndUpload(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);

      const formData = new FormData();

      if (this.selectedFile) {
        formData.append('picture', this.selectedFile, this.selectedFile.name);
      }

      const token = localStorage.getItem('trackit');
      if (!token) {
        console.error('Nincs érvényes token!');
        alert('Nincs bejelentkezve! Kérem jelentkezzen be!');
        return;
      }

      this.http.post<any>(`http://localhost:3000/users/add-picture`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).subscribe({
        next: (response) => {
          this.modalVisible = true;
          this.modalType = 'success';
          this.modalMessage = 'Profilkép sikeresen beállítva/frissítve!';
          this.autoCloseModal();
        },
        error: (error) => {
          console.error('Hiba a kép feltöltésekor:', error);
          if (error.status === 401) {
            alert('Nincs bejelentkezve! Kérem jelentkezzen be!');
          }
        }
      });
    } else {
      console.error('Nem választottál ki fájlt a feltöltéshez.');
    }
  }

  updateUserPicture() {
    if (!this.selectedFile) {
      console.error('Nincs kiválasztott fájl frissítéshez.');
      alert('Kérlek, válassz egy képet frissítéshez!');
      return;
    }

    const token = localStorage.getItem('trackit');
    if (!token) {
      console.error('Nincs érvényes token!');
      alert('Nincs bejelentkezve! Kérem jelentkezzen be!');
      return;
    }

    const formData = new FormData();
    formData.append('picture', this.selectedFile, this.selectedFile.name);

    this.http.put<any>(`http://localhost:3000/users/${this.user.id}/picture`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).subscribe({
      next: (response) => {
        console.log('Kép sikeresen frissítve:', response);

        // Modal alert megjelenítése
        this.modalVisible = true;
        this.modalType = 'success';
        this.modalMessage = 'Profilkép sikeresen frissítve!';
        this.autoCloseModal();
      },
      error: (error) => {
        console.error('Hiba a kép frissítésekor:', error);
      }
    });
  }

  autoCloseModal() {
    setTimeout(() => {
      this.modalVisible = false;
    }, 5000);
  }
}
