import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-newpostmodal',
  imports: [CommonModule, FormsModule],
  templateUrl: './newpostmodal.component.html',
  styleUrls: ['./newpostmodal.component.scss']
})
export class NewpostmodalComponent {
  @Output() closePopup = new EventEmitter<void>(); // Esemény a popup bezárásához

  postContent: string = ''; // A poszt tartalma

  // Modal bezárása
  closeModal() {
    this.closePopup.emit(); // Esemény kibocsátása, hogy a szülő komponens bezárja a modalt
  }

  // Poszt küldése
  submitPost() {
    console.log("Poszt közzétéve:", this.postContent);
    this.closeModal(); // Bezárja a popupot a mentés után
  }
}
