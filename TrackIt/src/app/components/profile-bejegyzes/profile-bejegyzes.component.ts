import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../services/message.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewpostComponent } from '../newpost/newpost.component';

@Component({
  selector: 'app-profile-bejegyzes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-bejegyzes.component.html',
  styleUrl: './profile-bejegyzes.component.scss'
})
export class ProfileBejegyzesComponent {
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
}
