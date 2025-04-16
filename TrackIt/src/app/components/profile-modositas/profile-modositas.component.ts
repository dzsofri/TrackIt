import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { take } from 'rxjs';
 
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
  ) {
    this.setMinDate();
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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
  
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
  
      const reader = new FileReader();
  
      // Generálja az előnézet URL-jét
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.imagePreviewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
  
      // FormData előkészítése a feltöltéshez
      const formData = new FormData();
      formData.append("picture", file);
  
      // Kép feltöltése az API-n keresztül
      this.api.postUserPicture(formData).subscribe({
        next: (res: any) => {
          console.log("Profile picture uploaded successfully:", res);
  
          // Frissítse az előnézet URL-jét a szerver válasza alapján
          if (res.user && res.user.imageUrl) {
            this.imagePreviewUrl = res.user.imageUrl;
          }
  
          // Frissítse a pictureId mezőt
          if (res.user && res.user.pictureId) {
            this.user.pictureId = res.user.pictureId;
            console.log("Picture ID updated:", this.user.pictureId);
          }
        },
        error: (error: any) => {
          console.error("Error uploading profile picture:", error);
        },
      });
    } else {
      console.error("No file selected for upload.");
    }
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
              console.log(res.message);

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
              console.log('Hiba történt:', error);

              this.modalVisible = true;
              this.modalType = 'error';
              this.modalMessage = error.error.message || 'Hiba történt az adatok frissítése során.';
              this.invalidFields = error.error.invalid || "";

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
            console.error('Hiba történt az emlékeztető beállításakor:', error);

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