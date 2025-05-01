import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-watertracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './watertracker.component.html',
  styleUrl: './watertracker.component.scss'
})
export class WatertrackerComponent {
  completed = false;
  waterAmount: number | null = null;

  saveWater() {
    // Itt írd meg az adatmentés logikáját
    console.log('Mentés:', {
      completed: this.completed,
      amount: this.waterAmount
    });
  }

  openCalendar() {
    // Itt írd meg a naptár funkciót (pl. modal megnyitása)
    console.log('Naptár megnyitása');
  }
}
