import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-alert-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert-modal.component.html',
  styleUrls: ['./alert-modal.component.scss']
})

export class AlertModalComponent {
  @Input() visible = false;
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';
  @Input() message = '';
  @Input() invalidFields: string[] = [];  // Az invalidFields itt lesz deklarálva
  @Output() close = new EventEmitter<void>();

  openModal(type: 'success' | 'error' | 'warning' | 'info', message: string, invalidFields: string[] = []) {
    this.type = type;
    this.message = message;
    this.invalidFields = invalidFields;  // Ha van invalid mező, beállítjuk
    console.log(invalidFields , 'vaukkaa')
    this.visible = true;
  }

  closeModal() {
    this.visible = false;
    this.close.emit();  // Ha a szülő komponensnek is szüksége van erre, hogy reagáljon
  }
}
