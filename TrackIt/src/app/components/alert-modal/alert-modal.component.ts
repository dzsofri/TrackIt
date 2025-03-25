import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-alert-modal',
  templateUrl: './alert-modal.component.html',
  styleUrls: ['./alert-modal.component.scss'],
  imports: [CommonModule]
})
export class AlertModalComponent {
  @Input() visible: boolean = false;
  @Input() type: 'success' | 'danger' | 'alert' | 'primary' = 'primary';
  @Input() message: string = 'Ez egy üzenet!';
  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.visible = false;
    this.close.emit();
  }
}
