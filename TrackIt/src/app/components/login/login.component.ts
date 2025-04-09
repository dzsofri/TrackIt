import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { User } from '../../interfaces/user';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../environments/environment';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  modalVisible = false;
  modalType: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalMessage = '';
  invalidFields: string[] = [];

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  // Feltételezve, hogy van egy gomb a státusz frissítésére
updateUserStatus(newStatus: string): void {
  this.api.updateStatus(newStatus).subscribe(response => {
    if (response.message === 'Státusz sikeresen frissítve.') {
      console.log('Státusz sikeresen frissítve');
    } else {
      console.error('Hiba történt a státusz frissítésekor', response.message);
    }
  });
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

            // Modal beállítása sikeres bejelentkezéshez
            this.modalMessage = res.message || 'Sikeres bejelentkezés!';
            this.modalType = 'success';
            this.modalVisible = true;

            this.updateUserStatus('online');

            setTimeout(() => {
              this.modalVisible = false;
              this.router.navigateByUrl('/profile'); // Redirect to profile page
            }, 2000);
          } else {
            // Ha nem érkezik token a válaszban
            this.modalMessage = res.message || 'Hiba történt a bejelentkezés során!';
            this.modalType = 'error';
            this.modalVisible = true;
            this.invalidFields = this.invalidFields;
          }
        } else {
          // Ha vannak hibás mezők
          console.log('HIBA:', res.message);

          // Modal beállítása a hibás mezők listájával
          this.modalMessage = 'Hibás bejelentkezési adatok! Kérjük ellenőrizze a következő mezőket: ';
          this.modalType = 'error'; // Hibás bejelentkezési adatok esetén error
          this.modalVisible = true;
          this.invalidFields = this.invalidFields;
        }
      },
      error: (err) => {
        // API hiba esetén
        this.modalMessage = err.error?.message || 'Ismeretlen hiba történt!';
        this.modalType = 'error';
        this.modalVisible = true;
        this.invalidFields = this.invalidFields;
      }
    });
  }

  isInvalid(field: string) {
    return this.invalidFields.includes(field); // Visszaadja, hogy a mező hibás-e
  }
}
