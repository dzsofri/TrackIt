import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../services/message.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-bejegyzes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-bejegyzes.component.html',
  styleUrls: ['./profile-bejegyzes.component.scss']
})
export class ProfileBejegyzesComponent {
  posts: any[] = []; // A posztok tárolása

  constructor(
    private apiService: ApiService,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private message: MessageService
  ) {}

  activeTab: string = 'statisztika';
  setActiveTab(tabName: string) {
    this.activeTab = tabName;
  }

  ngOnInit() {
    this.loadPosts(); // A posztok betöltése
  }

  loadPosts() {
    this.apiService.getPosts().subscribe(response => {
      this.posts = response.posts || [];
    }, error => {
      console.error('Hiba a posztok betöltésekor:', error);
    });
  }

  toggleMenu(post: any) {
    post.showMenu = !post.showMenu;  // Menü megjelenítése/eltüntetése
  }

  editPost(post: any) {
    console.log('Módosítás: ', post);
    // Módosítás logika ide
  }

  deletePost(post: any) {
    console.log('Törlés: ', post);
    // Törlés logika ide
  }
}
