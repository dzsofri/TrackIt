import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { User } from '../../interfaces/user';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule instead of HttpClient

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, HttpClientModule], // Use HttpClientModule here
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  constructor(private api: ApiService) {}

  isPasswordVisible = false;
  invalidFields: string[] = [];
  
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

  onSubmit() {
    this.api.registration(this.user).subscribe({
      next: (res: any) => {
        console.log(res.message);
        this.errorMessage = ''; 
      },
      error: (error: any) => {
        console.log('Hiba történt:', error.error.error);
        this.errorMessage = error.error.error || 'Hiba történt a regisztráció során.';
      }
    });
  }
}
