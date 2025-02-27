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
  
  user: Partial<User> = {
    email: ''
  };


  isAdmin: boolean = false; 
  onSubmit() {
    if (!this.user.email) {
      console.error('HIBA: Az email mező üres!');
      return;
    }
  
    this.api.forgotPassword(this.user.email).subscribe({
      next: (res: any) => {
        console.log('Sikeresen elküldve:', res.message);
        console.log('Ellenőrizd az emailjeidet a visszaállítási linkért.');
      },
      error: (err) => {
        console.error('Forgot password API hiba:', err);
        console.log('HIBA:', err.message || 'Ismeretlen hiba történt', 'danger');
      }
    });
  }
  
  
  

  isInvalid(field: string) {
    console.log('dfrsrd',this.invalidFields)
    return this.invalidFields.includes(field);
  }
}
