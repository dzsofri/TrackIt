import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../services/message.service';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-profile-modositas',
  imports: [],
  templateUrl: './profile-modositas.component.html',
  styleUrl: './profile-modositas.component.scss'
})
export class ProfileModositasComponent {
  constructor(
    private api: ApiService,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private message: MessageService
  ) {}

  activeTab: string = 'statisztika';
  setActiveTab(tabName: string) {
    this.activeTab = tabName;
  }

  user: User = {
      id: '',
      name: '',
      email: '',
      password: '',
      role: '',
      pictureId: '',
      createdAt: '',
      confirm: ''
  };

  invalidFields: string[] = [];
  isPasswordVisible = false;
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}