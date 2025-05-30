import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { take } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile-modositas',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertModalComponent],
  templateUrl: './profile-modositas.component.html',
  styleUrls: ['./profile-modositas.component.scss']
})
export class ProfileModositasComponent {
  user: User = {
    id: '',
    name: '',
    email: '',
    password: '',
    role: '',
    pictureId: '',
    createdAt: '',
    reminderAt: '',
    confirm: ''
  };

  modalVisible = false;
  modalType: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalMessage = '';
  invalidFields: string[] = [];
  errorMessage: string = '';
  isPasswordVisible = false;
  isConfirmPasswordVisible = false;
  minDate: string = '';

  selectedFile: File | null = null;
  selectedFileName: string | null = null;
  imagePreviewUrl: string | null = null;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private http: HttpClient
  ) {
    this.setMinDate();
  }

  ngOnInit(): void {
    this.auth.user$.subscribe((user) => {
      if (user) {
        this.user.id = user.id;
        this.fetchUserProfilePicture(this.user.id);
      }
    });
  }

  private setMinDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.minDate = `${year}-${month}-${day}`;
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
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
      formData.append('picture', file, file.name);

      const token = localStorage.getItem('trackit');
      if (!token) {
        alert('Nincs bejelentkezve! Kérem jelentkezzen be!');
        return;
      }

      this.http.post<any>(`http://localhost:3000/users/add-picture`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: () => {
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
      alert('Kérlek, válassz egy képet frissítéshez!');
      return;
    }

    const token = localStorage.getItem('trackit');
    if (!token) {
      alert('Nincs bejelentkezve! Kérem jelentkezzen be!');
      return;
    }

    const formData = new FormData();
    formData.append('picture', this.selectedFile, this.selectedFile.name);

    this.http.put<any>(`http://localhost:3000/users/${this.user.id}/picture`, formData, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
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

  onSubmit() {
    this.invalidFields = [];

    if (!this.user.name) this.invalidFields.push('name');
    if (!this.user.email) this.invalidFields.push('email');
    if (!this.user.password) this.invalidFields.push('password');
    if (this.user.password !== this.user.confirm) {
      this.invalidFields.push('confirmPassword');
      this.modalVisible = true;
      this.modalType = 'error';
      this.modalMessage = 'A jelszavak nem egyeznek!';
      return;
    }

    if (this.invalidFields.length > 0) {
      this.modalVisible = true;
      this.modalType = 'error';
      this.modalMessage = 'Hiányzó vagy érvénytelen mezők!';
      return;
    }

    this.auth.user$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.user.id = user.id;

        if (this.user.id) {
          this.api.updateUserData(this.user.id, this.user).subscribe({
            next: (res: any) => {
              this.modalVisible = true;
              this.modalType = 'success';
              this.modalMessage = 'Felhasználó sikeresen frissítve!';
              this.invalidFields = [];
              this.autoCloseModal();

              if (res.token) {
                this.auth.login(res.token);
              } else {
                console.error('HIBA: A token hiányzik a válaszból');
              }

              this.errorMessage = '';
              this.user.name = '';
              this.user.email = '';
              this.user.password = '';
              this.user.confirm = '';
            },
            error: (error: any) => {
              this.modalVisible = true;
              this.modalType = 'error';
              this.modalMessage = error.error.message || 'Hiba történt az adatok frissítése során.';
              this.invalidFields = error.error.invalid || [];
              this.errorMessage = error.error.message || 'Hiba történt az adatok frissítése során.';
            }
          });
        }
      }
    });
  }

  onSaveTime() {
    this.invalidFields = [];

    if (!this.user.reminderAt) {
      this.invalidFields.push('reminderAt');
      this.modalVisible = true;
      this.modalType = 'error';
      this.modalMessage = 'Kérlek, válassz egy dátumot az emlékeztetőhöz!';
      return;
    }

    this.auth.user$.pipe(take(1)).subscribe(user => {
      if (user && user.id) {
        this.api.setReminder(user.id, { reminderAt: this.user.reminderAt }).subscribe({
          next: (res: any) => {
            this.modalVisible = true;
            this.modalType = 'success';
            this.modalMessage = res.message || 'Emlékeztető sikeresen beállítva!';
            this.invalidFields = [];
            this.autoCloseModal();
            this.user.reminderAt = '';
          },
          error: (error: any) => {
            this.modalVisible = true;
            this.modalType = 'error';
            this.modalMessage = error.error.message || 'Hiba történt az emlékeztető mentése során.';
            this.invalidFields = error.error.invalid || [];
          }
        });
      } else {
        this.modalVisible = true;
        this.modalType = 'error';
        this.modalMessage = 'Felhasználói azonosító nem található.';
      }
    });
  }

  autoCloseModal() {
    setTimeout(() => {
      this.modalVisible = false;
    }, 5000);
  }
}
