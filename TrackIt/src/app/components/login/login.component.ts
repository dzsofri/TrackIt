import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { User } from '../../interfaces/user';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../environments/environment';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, HttpClientModule, AlertModalComponent], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  @Input() visible = false;
@Input() type: 'success' | 'danger' | 'alert' | 'primary' = 'primary';
@Input() message = '';
@Output() close = new EventEmitter<void>();
  isPasswordVisible = false;
  isConfirmPasswordVisible = false;
  private tokenName = environment.tokenName;

  invalidFields: string[] = [];
  user: User = { email: '', password: '' };
  isAdmin: boolean = false;

  // MODAL változók
  modalVisible = false;
  modalType: 'success' | 'danger' | 'alert' | 'primary' = 'primary';
  modalMessage = '';

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  onSubmit() {
    this.api.login(this.user.email, this.user.password).subscribe({
      next: (res: any) => {
        console.log('API válasz:', res);

        this.invalidFields = res.invalid || [];

        if (this.invalidFields.length === 0) {
          console.log('Sikeres bejelentkezés:', res.message);

          if (res.token) {
            this.auth.login(res.token);

            // Modal beállítása sikeres bejelentkezéshez
            this.modalMessage = 'Sikeres bejelentkezés!';
            this.modalType = 'success';
            this.modalVisible = true;

            setTimeout(() => {
              this.modalVisible = false;
              this.router.navigateByUrl('/profile');
            }, 2000);
          } else {
            console.error('HIBA: A token hiányzik a válaszból');

            // Modal beállítása hiba esetén
            this.modalMessage = 'Hiba történt a bejelentkezés során!';
            this.modalType = 'danger';
            this.modalVisible = true;
          }
        } else {
          console.log('HIBA:', res.message, 'danger');

          // Modal beállítása sikertelen bejelentkezés esetén
          this.modalMessage = 'Hibás bejelentkezési adatok!';
          this.modalType = 'danger';
          this.modalVisible = true;
        }
      },
      error: (err) => {
        console.error('Login API hiba:', err);

        // Modal beállítása API hiba esetén
        this.modalMessage = 'Ismeretlen hiba történt!';
        this.modalType = 'danger';
        this.modalVisible = true;
      }
    });
  }

  isInvalid(field: string) {
    return this.invalidFields.includes(field);
  }
}
