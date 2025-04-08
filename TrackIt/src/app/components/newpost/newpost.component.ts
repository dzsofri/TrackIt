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
  postContent: string = ''; // A poszt tartalma
  isPopupOpen: boolean = false; // Popup állapot (nyitva vagy zárva)
  postStatus: any;

  constructor(private apiService: ApiService) {}

  // Popup műveletek
  openPopup() {
    this.isPopupOpen = true;
  }

  // Popup bezárása
  closePopup() {
    this.isPopupOpen = false;
  }

  // A poszt tartalmának elmentése
  submitPost(content: string) {
    if (content.trim()) {
      if (!this.postStatus) {
        this.postStatus = 'published'; // Ha nincs státusz, akkor alapértelmezett 'published'
      }
  
      const postData = {
        title: 'Example Post Title',
        body: content,
        status: this.postStatus // Használjuk a `postStatus` változót
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
  
  

  // Amikor a modálban a posztot elküldik
  handlePostSubmit(postContent: string) {
    this.submitPost(postContent); // Átadjuk a tartalmat a submitPost metódusnak
  }
}
