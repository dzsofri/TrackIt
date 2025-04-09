import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../services/message.service';
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
  constructor(
    private api: ApiService,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private message: MessageService
  ) {}

  activeTab: string = 'statisztika';
  setActiveTab(tabName: string) {
    this.activeTab = tabName;
  }

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

  modalVisible = false;
  modalType: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalMessage = '';
  invalidFields: string[] = []

  isPasswordVisible = false;
  isConfirmPasswordVisible = false;

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }

  onSubmit() {
    this.invalidFields = [];
  
    this.auth.user$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.user.id = user.id;
  
        if (this.user.id) {
          this.api.updateUserData(this.user.id, this.user).subscribe({
            next: (res: any) => {
              if (res.user) {
                this.user = res.user;
              }
  
              this.invalidFields = res.invalid || [];
  
              if (this.invalidFields.length === 0) {
                this.modalMessage = res.message || 'Profile updated successfully';
                this.modalType = 'success';
                this.modalVisible = true;
  
                setTimeout(() => {
                  this.modalVisible = false;
                }, 2000);
              } else {
                this.modalMessage = `Hibás adatok! Ellenőrizze a következő mezőket: ${this.invalidFields.join(', ')}`;
                this.modalType = 'error';
                this.modalVisible = true;
              }
            },
            error: (err) => {
              if (err.status === 400) {
                this.invalidFields = err.error?.invalid || [];
                this.modalMessage = `Hibás adatok! Ellenőrizze a következő mezőket: ${this.invalidFields.join(', ')}`;
              } else {
                this.modalMessage = err.error?.message || 'Ismeretlen hiba történt!';
              }
  
              this.modalType = 'error';
              this.modalVisible = true;
            }
          });
        } else {
          this.modalMessage = 'User ID is missing!';
          this.modalType = 'error';
          this.modalVisible = true;
        }
      } else {
        this.modalMessage = 'User ID is missing!';
        this.modalType = 'error';
        this.modalVisible = true;
      }
    });
  }
}