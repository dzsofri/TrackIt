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
      this.modalMessage = 'Hiányzó vagy érvénytelen mezők:';
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
    console.log('Időpont mentése gomb kattintva');
  }

  autoCloseModal() {
    setTimeout(() => {
      this.modalVisible = false;
    }, 5000);
  }
}
