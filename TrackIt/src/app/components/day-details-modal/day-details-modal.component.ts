import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-day-details-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './day-details-modal.component.html',
  styleUrl: './day-details-modal.component.scss'
})
export class DayDetailsModalComponent  {

  @Input() visible: boolean = false;
  @Input() day: any;
  @Output() close = new EventEmitter<void>();


  closeModal() {
    this.close.emit();
  }


}
