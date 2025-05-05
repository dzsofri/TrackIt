import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { User } from '../../interfaces/user';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registration',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss'
})
export class RegistrationComponent {
  isPasswordVisible = false;
  isConfirmPasswordVisible = false;
  invalidFields: string[] = [];

  user: User = {
    name: '',
    email: '',
    password: '',
    confirm: ''
  };


  errorMessage: string = '';

  constructor(
    private api: ApiService,
    private router: Router,
    private auth: AuthService
  ){}

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


  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }

  onSubmit() {
    this.api.registration(this.user).subscribe({
      next: (res: any) => {
        // ✅ TELJES válasz logolása a hibakereséshez
        console.log('Teljes válasz:', res);
        console.log('Token:', res.token);
        console.log('UserId:', res.userId);
  
        console.log(res.message);
  
        if (res.token && res.userId) {
          this.auth.login(res.token);
  
          // 🎯 Itt hozzuk létre az alap trackereket
          const defaultTrackers = [
            { habitName: 'Vízfogyasztás', targetValue: 2000, currentValue: 0, frequency: 'daily', userId: res.userId },
            { habitName: 'Edzés', targetValue: 30, currentValue: 0, frequency: 'daily', userId: res.userId },
            { habitName: 'Alvás', targetValue: 8, currentValue: 0, frequency: 'daily', userId: res.userId }
          ];
  
          // Trackerek létrehozása
          defaultTrackers.forEach(tracker => {
            this.api.createHabit(tracker).subscribe(result => {
              console.log(`${tracker.habitName} létrehozva:`, result);
            });
          });
  
          // Felhasználó státusza online-ra változtatása
          this.updateUserStatus("online");
  
          // Hibaüzenet törlése, navigálás a welcome oldalra
          this.errorMessage = '';
          this.router.navigateByUrl('/welcome');
        } else {
          // Ha a válaszban nincs token vagy userId
          console.error('HIBA: A token vagy userId hiányzik a válaszból');
          this.errorMessage = 'A regisztrációs folyamat során hiba történt. Kérem próbálja újra.';
        }
      },
      error: (error: any) => {
        // Regisztrációs hiba kezelése
        console.log('Hiba történt:', error);
        this.errorMessage = error.message || 'Hiba történt a regisztráció során.';
      }
    });
  }
  
}
