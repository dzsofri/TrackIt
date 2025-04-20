import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { User } from '../../interfaces/user';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../environments/environment';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReminderService } from '../../services/reminder.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, AlertModalComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  isPasswordVisible = false;
  user: User = { email: '', password: '' };

  // Modal változók
  modalVisible = false;
  modalType: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalMessage = '';
  invalidFields: string[] = [];
  reminderMessage: string | null = null;
  modalButtons: { label: string, action: () => void, class?: string }[] = [];

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private reminderService: ReminderService
  ) {}

  private formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  private checkReminder(reminderAt: string): boolean {
    const reminderDate = this.formatDateToYYYYMMDD(new Date(reminderAt));
    const currentDate = this.formatDateToYYYYMMDD(new Date());
    return reminderDate === currentDate;
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  onSubmit() {
    this.invalidFields = [];
  
    this.api.login(this.user.email, this.user.password).subscribe({
      next: (res: any) => {
        this.invalidFields = res.invalid || [];
        console.log('API válasza:', res);
  
        if (this.invalidFields.length === 0) {
          if (res.token) {
            this.auth.login(res.token);
  
            const reminderAt = res.user?.reminderAt || null;
            const shouldShowReminder = reminderAt && this.checkReminder(reminderAt);
  
            this.modalMessage = 'Sikeres bejelentkezés!';
            this.modalType = 'success';
            this.modalButtons = [];
            this.modalVisible = true;
  
            setTimeout(() => {
              this.modalVisible = false;
              this.router.navigateByUrl('/feed');
            
              if (shouldShowReminder) {
                this.reminderService.showReminder(
                  "Felezd be a megmaradt kihívásaidat, mielőtt lejár a kihívásra szánt idő. Ne feledd, a határidő közeleg!"
                );
              }
            }, 5000);
  
          } else {
            this.modalMessage = res.message || 'Hiba történt a bejelentkezés során!';
            this.modalType = 'error';
            this.modalVisible = true;
          }
        } else {
          this.modalMessage = 'Hibás bejelentkezési adatok!';
          this.modalType = 'error';
          this.modalVisible = true;
        }
      },
      error: (err) => {
        this.modalMessage = err.error?.message || 'Ismeretlen hiba történt!';
        this.modalType = 'error';
        this.modalVisible = true;
      }
    });
  }
  
  showReminderModal(reminderMessage: string) {
    this.modalMessage = reminderMessage;
    this.modalType = 'info';
    this.modalButtons = [
      {
        label: 'OK',
        action: () => {
          this.onModalClose();
        },
        class: 'btn-primary'
      }
    ];
    this.modalVisible = true;
  }
  
  onModalClose() {
    this.modalVisible = false;
  }

  autoCloseModal() {
    setTimeout(() => {
      this.modalVisible = false;
    }, 5000);
  }
}
