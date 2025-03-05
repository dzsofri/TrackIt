import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { User_statistics } from '../../interfaces/user_statistics';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit{
  constructor(
    private api: ApiService,
  ){}

  user_id: string = "";
  user_statistics:User_statistics[] = []

  ngOnInit(): void {
    this.getUserStatistics();
  }

  getUserStatistics() {
    this.api.read_Stat('user_statistics', 'id', 'eq', this.user_id).subscribe((res: any) => {
      if (res) {
        this.user_statistics = res as User_statistics[];
      }
    });
  }

  activeTab: string = 'statisztika';

  setActiveTab(tabName: string) {
    this.activeTab = tabName;
  }

  isPasswordVisible = false;
  
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}