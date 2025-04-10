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

  errorMessage: string = '';

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
              console.log(res.message);
  
              // Sikeres frissítés
              this.modalVisible = true;
              this.modalType = 'success';
              this.modalMessage = 'Felhasználó sikeresen frissítve!';
              this.invalidFields = [];
  
              if (res.token) {
                this.auth.login(res.token);
              } else {
                console.error('HIBA: A token hiányzik a válaszból');
              }
  
              this.errorMessage = '';
            },
            error: (error: any) => {
              console.log('Hiba történt:', error);
  
              // Hiba történt
              this.modalVisible = true;
              this.modalType = 'error';
              this.modalMessage = error.error.message || 'Hiba történt a felhasználó frissítése során.';
              this.invalidFields = error.error.invalid || [];
  
              this.errorMessage = error.error.message || 'Hiba történt a regisztráció során.';
            }
          });
        }
      }
    });
  }
}