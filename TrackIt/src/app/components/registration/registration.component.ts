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

private getRandomIntRounded(min: number, max: number): number {
  return Math.round(Math.random() * (max - min) + min);
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
            targetValue: this.getRandomIntRounded(1500, 3000),
            currentValue: 0,
            frequency: 'daily',
            userId
          },
          {
            habitName: 'Edzés',
            targetValue: this.getRandomIntRounded(15, 60), // perc
            currentValue: 0,
            frequency: 'daily',
            userId
          },
          {
            habitName: 'Alvás',
            targetValue: this.getRandomIntRounded(6, 9), // óra
            currentValue: 0,
            frequency: 'daily',
            userId
          }
        ];
      
          defaultTrackers.forEach(tracker => {
            this.api.createHabit(tracker).subscribe(result => {
              console.log(`${tracker.habitName} létrehozva:`, result);

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