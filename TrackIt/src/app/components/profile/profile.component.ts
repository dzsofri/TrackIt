import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { User_statistics } from '../../interfaces/user_statistics';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit{
  constructor(
    private api: ApiService,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute
  ){}

  user_id: string = "";
  //isLoggedIn:boolean = false;
  user_statistics:User_statistics[] = [];

  ngOnInit(): void {
    /*
    this.auth.isLoggedIn$.subscribe(res => {
      this.isLoggedIn = res;
    });

    this.user_id = this.activatedRoute.snapshot.params['id'];

    this.api.read_Stat('user_statistics', 'id', 'eq', this.user_id).subscribe((res: any) => {
      if (res) {
        this.user_statistics = res as User_statistics[];
      }
    });
    */

    this.api.readAll('user_statsitics').subscribe({
      next: (res: any) => {
        if (!res || !res.statistics || res.statistics.length === 0) {
          console.warn('Nincsenek felhasználói statisztikák.');
          return;
        }
        this.user_statistics = res.statistics as User_statistics[];
      },
      error: (err) => {
        console.error('Hiba történt az adatok lekérésekor:', err);
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