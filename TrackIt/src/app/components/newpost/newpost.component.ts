import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NewpostmodalComponent } from '../newpostmodal/newpostmodal.component';

@Component({
  selector: 'app-newpost',
  imports: [CommonModule, FormsModule, NewpostmodalComponent],
  templateUrl: './newpost.component.html',
  styleUrls: ['./newpost.component.scss']
})
export class NewpostComponent {
  postContent: string = ''; // A poszt tartalma
  isPopupOpen: boolean = false; // Popup állapot (nyitva vagy zárva)

  // Popup megnyitása
  openPopup() {
    this.isPopupOpen = true;
  }

  // Popup bezárása
  closePopup() {
    this.isPopupOpen = false;
  }

  // Poszt beküldése
  submitPost() {
    if (this.postContent.trim()) {
      console.log('Új bejegyzés:', this.postContent); // Poszt tartalma
      this.postContent = ''; // Mező ürítése a beküldés után
      this.closePopup(); // Popup bezárása a posztolás után
    }
  }
}
