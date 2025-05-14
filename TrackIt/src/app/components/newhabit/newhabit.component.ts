import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TrackerComponent } from '../tracker/tracker.component';

@Component({
  selector: 'app-newhabit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './newhabit.component.html',
  styleUrls: ['./newhabit.component.scss']
})
export class NewhabitComponent {
  @Input() userId!: string;
  @Input() units: string[] = [];

  @Output() habitCreated = new EventEmitter<{ habit: any }>();
  @Output() close = new EventEmitter<void>();

  newHabitName: string = '';
  dailyTarget: number = 1;  // Set a default value for dailyTarget
  selectedUnit: string = ''; // Declare selectedUnit
  startDate: string = ''; // Declare startDate
  targetValue: number = 1; // Declare habitDuration

  createHabit() {
    if (!this.newHabitName) {
      alert('Kérlek, add meg a szokás nevét.');
      return;
    }

    if (!this.dailyTarget || this.dailyTarget <= 0) {
      alert('Kérlek, adj meg egy érvényes napi célt!');
      return;
    }

    const payload = {
      habitName: this.newHabitName,
      currentValue: 0,
      dailyTarget: this.dailyTarget,
      userId: this.userId,
      unit: this.selectedUnit,
      startDate: this.startDate,
      targetValue: this.targetValue
    };

    this.habitCreated.emit({ habit: payload });
    this.resetForm();
  }

  resetForm() {
    // Clear form fields after submission
    this.newHabitName = '';
    this.dailyTarget = 1;  // Reset to the default value
    this.selectedUnit = '';
    this.startDate = '';
    this.targetValue = 1;  // Reset to the default value
  }

  closePopup() {
    this.close.emit();
  }
}
