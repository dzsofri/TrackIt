import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { User } from '../../interfaces/user';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../environments/environment';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, HttpClientModule, AlertModalComponent], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {


  isPasswordVisible = false;
  isConfirmPasswordVisible = false;
  private tokenName = environment.tokenName;

  invalidFields: string[] = [];
  user: User = { email: '', password: '' };
  isAdmin: boolean = false;

  // MODAL változók
  modalVisible = false;
  modalType: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalMessage = '';

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  onSubmit() {
    this.api.login(this.user.email, this.user.password).subscribe({
      next: (res: any) => {
        console.log('API válasz:', res);
        this.invalidFields = res.invalid || [];
  
        if (this.invalidFields.length === 0) {
          if (res.token) {
            this.auth.login(res.token);
  
            // Modal beállítása sikeres bejelentkezéshez
            this.modalMessage = res.message || 'Sikeres bejelentkezés!';
            this.modalType = 'success';
            this.modalVisible = true;
  
            // Debugging modal összes adatát kiírni
            console.log('Modal adatai (sikeres bejelentkezés után):', {
              modalMessage: this.modalMessage,
              modalType: this.modalType,
              modalVisible: this.modalVisible
            });
  
            // 2 másodperc múlva bezárni a modalt és navigálni
            setTimeout(() => {
              this.modalVisible = false;
              this.router.navigateByUrl('/profile');
            }, 2000);
  
          } else {
            console.error('HIBA: A token hiányzik a válaszból');
  
            this.modalMessage = res.message || 'Hiba történt a bejelentkezés során!';
            this.modalType = 'success';
            this.modalVisible = true;
  
            // Debugging modal összes adatát kiírni hiba esetén
            console.log('Modal adatai (hiba esetén):', {
              modalMessage: this.modalMessage,
              modalType: this.modalType,
              modalVisible: this.modalVisible
            });
          }
        } else {
          console.log('HIBA:', res.message);
  
          this.modalMessage = res.message || 'Hibás bejelentkezési adatok!';
          this.modalType = 'error';
          this.modalVisible = true;
  
          // Debugging modal összes adatát kiírni hibás bejelentkezés esetén
          console.log('Modal adatai (hibás bejelentkezés):', {
            modalMessage: this.modalMessage,
            modalType: this.modalType,
            modalVisible: this.modalVisible
          });
          
        }
      },
      error: (err) => {
        console.error('Login API hiba:', err);
  
        // Hiba esetén modal beállítása
        this.modalMessage = err.error.message || 'Ismeretlen hiba történt!';
        this.modalType = 'error';
        this.modalVisible = true;
  
        // Debugging modal összes adatát kiírni API hiba esetén
        console.log('Modal adatai (API hiba):', {
          modalMessage: this.modalMessage,
          modalType: this.modalType,
          modalVisible: this.modalVisible
        });
      }
    });
  }
  

  

  isInvalid(field: string) {
    return this.invalidFields.includes(field);
  }
}
