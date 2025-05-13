import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditpostmodalComponent } from '../editpostmodal/editpostmodal.component';


@Component({
  selector: 'app-profile-bejegyzes',
  standalone: true,
  imports: [CommonModule, FormsModule, EditpostmodalComponent],
  templateUrl: './profile-bejegyzes.component.html',
  styleUrls: ['./profile-bejegyzes.component.scss']
})
export class ProfileBejegyzesComponent {
  posts: any[] = []; // Az összes poszt
  selectedPost: any = null; // A kiválasztott poszt
  showEditModal: boolean = false; // A modal láthatósága
  currentUser: any = null;

  constructor(
    private apiService: ApiService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.auth.user$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.loadUserPosts(user._id || user.id);
      }
    });
  }

  loadUserPosts(userId: string) {
    this.apiService.getPosts().subscribe({
      next: response => {
        const allPosts = response.posts || [];
        this.posts = allPosts.filter(post => post.user?._id === userId || post.user?.id === userId);
      },
      error: err => {
        console.error('Hiba a posztok betöltésekor:', err);
      }
    });
  }

  toggleMenu(post: any) {
    post.showMenu = !post.showMenu;
  }

  editPost(post: any) {
    console.log("Módosítás gomb megnyomva", post);  // Ellenőrizd, hogy ide eljut-e
    this.selectedPost = { ...post };  // Létrehozunk egy másolatot a posztról
    this.showEditModal = true;  // Megjelenítjük a modal ablakot
  }

  saveEditedPost(updated: any) {
    this.apiService.updatePost(updated.id, updated).subscribe({
      next: () => {
        this.loadUserPosts(this.currentUser._id || this.currentUser.id); // Frissítjük a posztokat
        this.showEditModal = false; // A modal elrejtése
      },
      error: err => {
        console.error('Hiba a poszt frissítésekor:', err);
      }
    });
  }

  deletePost(post: any) {
    if (confirm('Biztosan törölni szeretnéd ezt a posztot?')) {
      this.apiService.deletePost(post.id).subscribe(response => {
        this.loadUserPosts(this.currentUser._id || this.currentUser.id);
      }, error => {
        console.error('Hiba a poszt törlésekor:', error);
      });
    }
  }

  cancelEdit() {
    this.selectedPost = null;
    this.showEditModal = false; // A modal elrejtése
  }
}