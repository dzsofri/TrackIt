import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';



@Component({
  selector: 'app-gymtracker',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDatepickerModule, MatFormFieldModule, MatInputModule],
  templateUrl: './gymtracker.component.html',
  styleUrl: './gymtracker.component.scss'
})
export class GymtrackerComponent {
  gymCompleted: boolean = false;
  gymAmount: number | null = null;
  gymDate: Date = new Date();

  saveGym(): void {
    if (!this.gymAmount || this.gymAmount <= 0) {
      alert('Kérlek adj meg érvényes edzésmennyiséget!');
      return;
    }

    const gymEntry = {
      date: this.gymDate.toISOString().split('T')[0],
      completed: this.gymCompleted,
      amount: this.gymAmount
    };

    console.log('Edzés adat mentve:', gymEntry);
    alert('Edzés adatok elmentve!');

    this.gymCompleted = false;
    this.gymAmount = null;
  }
} 