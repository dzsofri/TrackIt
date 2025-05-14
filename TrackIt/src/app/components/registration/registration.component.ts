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

private getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


  onSubmit() {
    this.api.registration(this.user).subscribe({
      next: (res: any) => {
        console.log('Teljes válasz:', res);
        console.log('Token:', res.token);
        console.log('UserId:', res.user?.id); // <<< MÓDOSÍTVA
      
        if (res.token && res.user?.id) {
          const userId = res.user.id;
      
          this.auth.login(res.token);
      
          const defaultTrackers = [
          {
            habitName: 'Vízfogyasztás',
            dailyTarget: this.getRandomInt(1500, 3000),
            targetValue: this.getRandomInt(7, 30),
            currentValue: 0,
            userId
          },
          {
            habitName: 'Edzés',
            dailyTarget: this.getRandomInt(30, 100),
            targetValue: this.getRandomInt(7, 30),
            currentValue: 0,
            userId
          },
          {
            habitName: 'Alvás',
            dailyTarget: this.getRandomInt(5, 12),
            targetValue: this.getRandomInt(7, 30),
            currentValue: 0,
            userId
          }
        ];
      
          defaultTrackers.forEach(tracker => {
    this.api.createHabit(tracker).subscribe({
      next: (res) => {
        console.log(`${tracker.habitName} létrehozva:`, res);
      },
      error: (err) => {
        console.error('Hiba a szokás létrehozásakor:', err);
      }
    });
  });
      
          this.updateUserStatus("online");
          this.errorMessage = '';
          this.router.navigateByUrl('/welcome');
        } else {
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