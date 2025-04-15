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
  posts: any[] = []; // Csak a saját posztok kerülnek ide
  currentUser: any = null; // Bejelentkezett user

  constructor(
    private apiService: ApiService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    // Bejelentkezett felhasználó adatainak betöltése
    this.auth.user$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.loadUserPosts(user._id || user.id); // Meghívjuk a posztokat a user ID alapján
      }
    });
  }

  loadUserPosts(userId: string) {
    this.apiService.getPosts().subscribe({
      next: response => {
        const allPosts = response.posts || [];
        // Szűrés: Csak a saját posztokat mutatjuk
        this.posts = allPosts.filter(post => post.user?._id === userId || post.user?.id === userId);
      },
      error: err => {
        console.error('Hiba a posztok betöltésekor:', err);
      }
    });
  }

  toggleMenu(post: any) {
    post.showMenu = !post.showMenu;  // Menü megjelenítése/elrejtése
  }

  editPost(post: any) {
    console.log('Módosítás: ', post);
    // Itt implementálhatod a poszt módosítási logikát (pl. modális ablak megnyitása)
    // Hívj egy modális komponenst vagy navigálj egy szerkesztő oldalra
  }

  deletePost(post: any) {
    if (confirm('Biztosan törölni szeretnéd ezt a posztot?')) {
      this.apiService.deletePost(post.id).subscribe(response => {
        this.loadUserPosts(this.currentUser._id || this.currentUser.id);  // Frissítjük a posztok listáját a törlés után
      }, error => {
        console.error('Hiba a poszt törlésekor:', error);
      });
    }
  }
}