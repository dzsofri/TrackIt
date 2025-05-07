import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from '../../services/api.service';


@Component({
  selector: 'app-watertracker',
  standalone: true,
  imports: [CommonModule, FormsModule, MatNativeDateModule, MatDatepickerModule, MatFormFieldModule, MatInputModule],
  templateUrl: './watertracker.component.html',
  styleUrl: './watertracker.component.scss'
})
export class WatertrackerComponent {
  completed = false;
  waterAmount: number | null = null;
  selectedDate: Date = new Date();
  savedEntries: any[] = [];

  constructor(private apiService: ApiService) {}

  saveWater() {
    if (!this.waterAmount || this.waterAmount <= 0) {
      alert('Adj meg egy érvényes vízmennyiséget!');
      return;
    }

    const data = {
      date: this.selectedDate.toISOString().split('T')[0],
      achieved: this.completed,
      value: this.waterAmount,
      habitId: 'water-tracker'
    };

    this.apiService.addHabitTrackingRecord(data).subscribe((res) => {
      console.log('Sikeres mentés:', res);
      this.savedEntries.push(data);
      this.waterAmount = null;
      this.completed = false;
    });
  }
}
