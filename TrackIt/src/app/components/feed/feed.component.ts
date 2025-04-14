import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ProfileBejegyzesComponent } from '../profile-bejegyzes/profile-bejegyzes.component';
import { NewpostComponent } from '../newpost/newpost.component';
import { NewpostmodalComponent } from '../newpostmodal/newpostmodal.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, ProfileBejegyzesComponent, NewpostComponent],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.scss'
})
export class FeedComponent {
  posts: any[] = [];  // A posztok tárolása

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadPosts();  // A posztok betöltése
  }

  loadPosts() {
    this.apiService.getPosts().subscribe(response => {
      this.posts = response.posts || [];  // Minden poszt betöltése
    }, error => {
      console.error('Hiba a posztok betöltésekor:', error);
    });
  }
}
