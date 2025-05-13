import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-post-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editpostmodal.component.html',
  styleUrl: './editpostmodal.component.scss'
})
export class EditpostmodalComponent {
  @Input() post: any = null;
  @Input() showModal: boolean = false;
  @Output() close = new EventEmitter();
  @Output() save = new EventEmitter<any>();

  // A modal ablak bezárása
  cancel() {
    this.close.emit(); // Bezárás esemény
  }

  // A poszt mentése
  savePost() {
    if (this.post) {
      this.save.emit(this.post); // Mentés esemény
    }
  }
}

