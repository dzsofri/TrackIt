import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute } from '@angular/router';
import { SajatKihivasComponent } from '../sajat-kihivas/sajat-kihivas.component';
import { FolyamatbanLevoKihivasComponent } from '../folyamatban-levo-kihivas/folyamatban-levo-kihivas.component';
import { PublikusKihivasokComponent } from '../publikus-kihivasok/publikus-kihivasok.component';

@Component({
  selector: 'app-challenge',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertModalComponent, SajatKihivasComponent, FolyamatbanLevoKihivasComponent, PublikusKihivasokComponent],
  templateUrl: './challenge.component.html',
  styleUrl: './challenge.component.scss',
})
export class ChallengeComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private api: ApiService
  ) {}

  user = {
    id: '',
    name: '',
    email: '',
    password: '',
    role: '',
    pictureId: '',
    createdAt: '',
    reminderAt: '',
    confirm: '',
  };

  id: string = '';

  modalVisible = false;
  modalType: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalMessage = '';
  imagePreviewUrl: string | null = null;

  activeTab: string = 'sajat_kihivasok';

  setActiveTab(tabName: string): void {
    this.activeTab = tabName;
  }

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.auth.user$.subscribe((user) => {
      if (user) {
        this.id = user.id;
        this.user.id = user.id;
      }
    });
  }

  autoCloseModal() {
    setTimeout(() => {
      this.modalVisible = false;
    }, 5000);
  }
}