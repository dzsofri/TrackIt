import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { User } from '../../interfaces/user';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

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

  constructor(private api: ApiService) {}

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
        this.errorMessage = ''; // Töröljük a hibát a sikeres regisztráció után
      },
      error: (error: any) => {
        console.log('Hiba történt:', error.error.error);
        this.errorMessage = error.error.error || 'Hiba történt a regisztráció során.';
      }
    });
  }
}
