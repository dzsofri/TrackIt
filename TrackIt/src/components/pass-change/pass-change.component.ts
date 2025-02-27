import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pass-change',
  imports: [FormsModule, CommonModule],
  templateUrl: './pass-change.component.html',
  styleUrl: './pass-change.component.scss'
})
export class PassChangeComponent implements OnInit {
  isPasswordVisible = false;
  isConfirmPasswordVisible = false;
  invalidFields: string[] = [];
  token: string = '';
  
  user = {
    email: '',
    password: '',
    confirmPassword: ''
  };

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // URL-ből kiolvassuk a token-t és az emailt
    this.route.queryParams.subscribe(params => {
      this.user.email = params['email'] || '';
      this.token = params['token'] || '';
    });
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }

  onSubmit() {
    if (!this.user.password || this.user.password !== this.user.confirmPassword) {
      console.error('HIBA: A jelszavak nem egyeznek vagy üresek!');
      return;
    }

    this.api.resetPassword(this. user.email, this.token, this.user.password).subscribe({
      next: (res: any) => {
        console.log('Sikeres jelszócsere:', res.message);
        alert('Sikeresen megváltoztattad a jelszavad! Jelentkezz be az új jelszóval.');
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        console.error('Jelszócsere API hiba:', err);
        alert('Hiba történt a jelszó módosítása közben.');
      }
    });
  }
}
