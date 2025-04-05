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

  constructor(private apiService: ApiService) {}

  // Popup megnyitása
  openPopup() {
    this.isPopupOpen = true;
  }

  // Popup bezárása
  closePopup() {
    this.isPopupOpen = false;
  }

  // Poszt beküldése
  submitPost(content: string) {
    if (content.trim()) {
      console.log('Új bejegyzés:', content); // Poszt tartalma
      const postData = {
        title: 'Example Post Title', // Cím, ha szükséges
        body: content,
        status: 'draft' // Alapértelmezett státusz
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
}
