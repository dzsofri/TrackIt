// newpost.component.ts

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NewpostmodalComponent } from '../newpostmodal/newpostmodal.component';
import { ApiService } from '../../services/api.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-newpost',
  standalone: true,
  imports: [CommonModule, FormsModule, NewpostmodalComponent],
  templateUrl: './newpost.component.html',
  styleUrls: ['./newpost.component.scss']
})
export class NewpostComponent {
  postTitle: string = '';
  postContent: string = '';
  isPopupOpen: boolean = false;
  postStatus: string = 'published';
   imagePreviewUrl: string | null = null;

  user: User = {
    id: '',
    name: '',
    email: '',
    password: '',
    role: '',
    pictureId: '',
    createdAt: '',
    reminderAt: '',
    confirm: ''
  };

 @Output() postSubmitted = new EventEmitter<void>();
  constructor(private apiService: ApiService, private http: HttpClient, private auth:AuthService) {}

  ngOnInit(): void {
    this.auth.user$.subscribe((user) => {
      if (user) {
        this.user.id = user.id;
        this.fetchUserProfilePicture(this.user.id);
      }
    });
  }

  openPopup() {
    this.isPopupOpen = true;
  }

  closePopup() {
    this.isPopupOpen = false;
  }

  fetchUserProfilePicture(userid: any): void {
    const token = localStorage.getItem('trackit');
    if (!token) {
      console.error('No valid token found!');
      return;
    }
    console.log(userid)
    console.log(token)

    this.http
      .get<{ imageUrl: string | null }>(`http://localhost:3000/users/profile-picture/${userid}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (response) => {
          this.imagePreviewUrl = response.imageUrl || '/assets/images/profileKep.png';
        },
        error: (error) => {
          console.error('Error fetching profile picture:', error);
          this.imagePreviewUrl = '/assets/images/profileKep.png';
        },
      });
  }

  submitPost() {
    if (this.postContent.trim()) {
      if (!this.postTitle.trim()) {
        this.postTitle = 'Név nélküli poszt'; // Alapértelmezett cím, ha nem adnak meg
      }

      const postData = {
        title: this.postTitle,  // A felhasználó által megadott cím
        body: this.postContent, // A poszt tartalma
        status: this.postStatus  // A státusz (pl. 'published')
      };

      this.apiService.createPost(postData).subscribe(
        response => {
          console.log('Poszt sikeresen létrehozva:', response);
          this.closePopup(); // Popup bezárása a posztolás után
          this.postSubmitted.emit();
        },
        error => {
          console.error('Hiba a poszt mentésekor:', error);
        }
      );
    }
  }

  handlePostSubmit(postContent: string) {

    console.log('Poszt létrejött, ID:', postContent);
  }


}
