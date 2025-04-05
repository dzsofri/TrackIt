import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  @Input() invalidFields: string[] = [];
  @Input() buttons: { label: string, action: () => void, class?: string }[] = [];

  @Output() close = new EventEmitter<void>();

  openModal(
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    invalidFields: string[] = [],
    buttons: { label: string, action: () => void, class?: string }[] = []
  ) {
    this.type = type;
    this.message = message;
    this.invalidFields = invalidFields;
    this.buttons = buttons;
    this.visible = true;
  }

  closeModal() {
    this.visible = false;
    this.close.emit();
  }
}
