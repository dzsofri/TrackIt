import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { User } from '../../interfaces/user';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../environments/environment';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, AlertModalComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  isPasswordVisible = false;
  user: User = { email: '', password: '' };

  // Modal változók
  modalVisible = true;
  modalType: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalMessage = '';
  invalidFields: string[] = [];
  reminderAt: string | null = null;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  onSubmit() {
    this.invalidFields = []; // Reset the invalid fields

    // API kérés
    this.api.login(this.user.email, this.user.password).subscribe({
      next: (res: any) => {
        // Ellenőrizzük, hogy van-e "invalid" mező
        this.invalidFields = res.invalid || [];
        console.log('API válasza:', res);

        // Ha nincs hibás mező
        if (this.invalidFields.length === 0) {
          if (res.token) {
            // Ha van érvényes token
            this.auth.login(res.token);

            // Tároljuk a reminderAt mezőt
            this.reminderAt = res.user.reminderAt;

            // Modal beállítása sikeres bejelentkezéshez
            this.modalMessage = res.message || 'Sikeres bejelentkezés!';
            this.modalType = 'success';
            this.modalVisible = true;

            setTimeout(() => {
              this.modalVisible = false;
              this.router.navigateByUrl('/profile').then(() => {
                this.checkReminder(); // Ellenőrizzük a reminderAt mezőt a navigáció után
              });
            }, 2000);
          } else {
            // Ha nem érkezik token a válaszban
            this.modalMessage = res.message || 'Hiba történt a bejelentkezés során!';
            this.modalType = 'error';
            this.modalVisible = true;
          }
        } else {
          // Ha vannak hibás mezők
          console.log('HIBA:', res.message);

          // Modal beállítása a hibás mezők listájával
          this.modalMessage = 'Hibás bejelentkezési adatok! Kérjük ellenőrizze a következő mezőket: ';
          this.modalType = 'error'; // Hibás bejelentkezési adatok esetén error
          this.modalVisible = true;
        }
      },
      error: (err) => {
        // API hiba esetén
        this.modalMessage = err.error?.message || 'Ismeretlen hiba történt!';
        this.modalType = 'error';
        this.modalVisible = true;
      }
    });
  }

  checkReminder() {
    if (this.reminderAt) {
      const reminderDate = new Date(this.reminderAt).toDateString();
      const currentDate = new Date().toDateString();
  
      if (reminderDate === currentDate) {
        this.modalMessage = 'Csináld meg a maradék kihívásokat!';
        this.modalType = 'info';
        this.modalVisible = true;
      }
    }
  }

  isInvalid(field: string) {
    return this.invalidFields.includes(field);
  }
}