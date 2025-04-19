// newpost.component.ts

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NewpostmodalComponent } from '../newpostmodal/newpostmodal.component';
import { ApiService } from '../../services/api.service';

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

  constructor(private apiService: ApiService) {}

  openPopup() {
    this.isPopupOpen = true;
  }

  closePopup() {
    this.isPopupOpen = false;
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
