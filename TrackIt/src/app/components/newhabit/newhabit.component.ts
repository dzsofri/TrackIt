import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TrackerComponent } from '../tracker/tracker.component';

@Component({
  selector: 'app-newhabit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './newhabit.component.html',
  styleUrl: './newhabit.component.scss'
})
export class NewhabitComponent {
   @Input() userId!: string;
  @Input() units: string[] = [];

  @Output() habitCreated = new EventEmitter<{ habit: any }>();
  @Output() close = new EventEmitter<void>();

  newHabitName: string = '';

  createHabit() {
    if (!this.newHabitName) {
      alert('Kérlek, add meg a szokás nevét.');
      return;
    }

    const payload = {
      habitName: this.newHabitName,
      targetValue: 1,
      currentValue: 0,
      frequency: 'daily',
      userId: this.userId
    };

    this.habitCreated.emit({ habit: payload });
    this.newHabitName = '';
  }

  closePopup() {
    this.close.emit();
  }
}
