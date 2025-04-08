import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NewpostComponent } from '../newpost/newpost.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, NewpostComponent],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.scss'
})
export class FeedComponent {
  posts: any[] = []; // A posztok tárolása

  constructor(private apiService: ApiService) {}

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
}
