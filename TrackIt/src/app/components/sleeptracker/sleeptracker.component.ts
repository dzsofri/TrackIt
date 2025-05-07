import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-sleeptracker',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDatepickerModule, MatFormFieldModule, MatInputModule],
  templateUrl: './sleeptracker.component.html',
  styleUrl: './sleeptracker.component.scss'
})
export class SleeptrackerComponent {
  sleepCompleted: boolean = false;
  sleepAmount: number | null = null;
  sleepDate: Date = new Date();
  selectedDate: Date = new Date();

  saveSleep(): void {
    if (!this.sleepAmount || this.sleepAmount <= 0) {
      alert('Kérlek, adj meg érvényes alvásmennyiséget!');
      return;
    }

    const sleepEntry = {
      date: this.sleepDate.toISOString().split('T')[0],
      completed: this.sleepCompleted,
      amount: this.sleepAmount
    };

    console.log('Alvás adat mentve:', sleepEntry);
    alert('Alvás adatok mentve!');

    this.sleepCompleted = false;
    this.sleepAmount = null;
  }

  onDateSelected(date: Date): void {
    this.sleepDate = date;
    console.log('Kiválasztott dátum:', date);
  }


  openCalendar(): void {
    alert('A naptár funkció még fejlesztés alatt van.');
  }
}
