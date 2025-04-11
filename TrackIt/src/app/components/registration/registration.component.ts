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
        console.log(res.message);
        if (res.token) {
          this.auth.login(res.token);  // Csak a tokent adjuk át az AuthService-nek
          this.router.navigateByUrl('/profile');
        } else {
          console.error('HIBA: A token hiányzik a válaszból');
        }
        this.errorMessage = ''; // Töröljük a hibát a sikeres regisztráció után
        this.router.navigateByUrl('/welcome');
        this.updateUserStatus("online");
      },
      error: (error: any) => {
        console.log('Hiba történt:', error);
        this.errorMessage = error.message || 'Hiba történt a regisztráció során.';
      }
    });
  }
}
