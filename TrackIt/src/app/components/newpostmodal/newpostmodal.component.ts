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
  @Output() postSubmit = new EventEmitter<string>(); // Esemény a poszt tartalmának továbbításához

  postContent: string = ''; // A poszt tartalma

  // Modal bezárása
  closeModal() {
    this.closePopup.emit(); // Esemény kibocsátása a szülő komponensnek
  }

  // Poszt küldése
  submitPost() {
    if (this.postContent.trim()) {
      this.postSubmit.emit(this.postContent); // Poszt tartalma küldése a szülőnek
      this.closeModal(); // Bezárja a popupot a mentés után
    }
  }
}
