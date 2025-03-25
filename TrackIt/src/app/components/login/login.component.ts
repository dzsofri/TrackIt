import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { User } from '../../interfaces/user';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule instead of HttpClient
import { AuthService } from '../../services/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, HttpClientModule], // Use HttpClientModule here
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  isPasswordVisible = false;
  isConfirmPasswordVisible = false;
  private tokenName = environment.tokenName;



  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ){

  }

  invalidFields: string[] = [];

  user: User = {
    email: '',
    password: '',

  };

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  isAdmin: boolean = false;
   // Új változó, ami az admin státuszt tárolja
  onSubmit() {
    this.api.login(this.user.email, this.user.password).subscribe({
      next: (res: any) => {
        console.log('API válasz:', res);  // Debugging log

        this.invalidFields = res.invalid || [];

        if (this.invalidFields.length === 0) {


          if (res.token) {
            console.log('Sikeres bejelentkezés:', res.message);
            this.auth.login(res.token);  // Csak a tokent adjuk át az AuthService-nek
            this.router.navigateByUrl('/profile');
          } else {
            console.error('HIBA: A token hiányzik a válaszból');
          }
        } else {
          console.log('HIBA:', res.message, 'danger');
        }
      },
      error: (err) => {
        console.error('Login API hiba:', err);
        console.log('HIBA:', err.message || 'Ismeretlen hiba történt', 'danger');
      }
    });
  }




  isInvalid(field: string) {
    console.log('dfrsrd',this.invalidFields)
    return this.invalidFields.includes(field);
  }
}
