import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../services/message.service';
import { HttpClient } from '@angular/common/http';
import { WatertrackerComponent } from '../watertracker/watertracker.component';
import { SleeptrackerComponent } from '../sleeptracker/sleeptracker.component';
import { CustomtrackerComponent } from '../customtracker/customtracker.component';
import { GymtrackerComponent } from '../gymtracker/gymtracker.component';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';

@Component({
  selector: 'app-tracker',
  imports: [CommonModule, FormsModule, WatertrackerComponent, SleeptrackerComponent, CustomtrackerComponent, GymtrackerComponent, AlertModalComponent],
  templateUrl: './tracker.component.html',
  styleUrl: './tracker.component.scss'
})
export class TrackerComponent {
  constructor(
    private api: ApiService,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private message: MessageService,
    private http: HttpClient
  ) {}

  
  
  activeTab: string = 'watertracker'; // alapértelmezett aktív tab
  modalVisible = false;
  modalType: 'error' | 'success' | 'warning' | 'info' = 'info';
  modalMessage = '';

  imagePreviewUrl = 'path-to-image.jpg'; // ha kellene alapértelmezett kép
  user: any; // típus pontosítása később
  userNames: any = {}; // pl. objektum formában felhasználónevek

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
