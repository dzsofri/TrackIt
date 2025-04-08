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
  postTitle: string = ''; // A poszt címe
  postContent: string = ''; // A poszt tartalma
  isPopupOpen: boolean = false; // Popup állapot (nyitva vagy zárva)
  postStatus: string = 'published'; // Alapértelmezett státusz

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
  
  // Amikor a modálban a posztot elküldik
  handlePostSubmit(postContent: string) {
    this.postContent = postContent; // Beállítjuk a tartalmat
    this.submitPost(); // Átadjuk a tartalmat a submitPost metódusnak
  }
}
