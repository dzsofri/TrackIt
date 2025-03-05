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
 

  constructor(
    private api: ApiService,
    private router: Router
  ){}

  user: User = {
    name: '',
    email: '',
    password: '',
    confirm: ''
  };
  

  errorMessage: string = '';

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
        this.errorMessage = ''; 
        this.router.navigateByUrl('/login');
      },
      error: (error: any) => {
        console.log('Hiba történt:', error);
        this.errorMessage = error.message || 'Hiba történt a regisztráció során.';
      }
    });
  }
}
