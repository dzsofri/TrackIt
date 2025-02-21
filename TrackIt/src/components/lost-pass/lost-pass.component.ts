import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../interfaces/user';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lost-pass',
  imports: [FormsModule, CommonModule],
  templateUrl: './lost-pass.component.html',
  styleUrl: './lost-pass.component.scss'
})
export class LostPassComponent {


  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ){}

  invalidFields: string[] = [];
  
  user: User = {
    email: '',
    password: '',

  };


  isAdmin: boolean = false; 
   // Új változó, ami az admin státuszt tárolja
  onSubmit() {
    this.api.login(this.user.email, this.user.password).subscribe({
      next: (res: any) => {
        console.log('API válasz:', res);  // Debugging log
  
        this.invalidFields = res.invalid || [];
  
        if (this.invalidFields.length === 0) {
          console.log('Sikeres bejelentkezés:', res.message);
  
          if (res.token) {
            this.auth.login(res.token);  // Csak a tokent adjuk át az AuthService-nek
            this.router.navigateByUrl('/welcome');
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
