import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-registration',
  imports: [CommonModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss'
})
export class RegistrationComponent {
  isPasswordVisible = false;
  
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}

