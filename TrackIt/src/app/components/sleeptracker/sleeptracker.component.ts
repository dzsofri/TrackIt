import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sleeptracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sleeptracker.component.html',
  styleUrl: './sleeptracker.component.scss'
})
export class SleeptrackerComponent {
  completed: boolean = false;
  sleepAmount: number | null = null;

  saveSleep(): void {
    if (this.sleepAmount === null || this.sleepAmount <= 0) {
      alert('Kérlek, adj meg érvényes alvásmennyiséget!');
      return;
    }

    const sleepData = {
      completed: this.completed,
      sleepAmount: this.sleepAmount,
      date: new Date().toISOString().split('T')[0] // pl. '2025-05-01'
    };

    // Itt később API-hívás történhetne
    console.log('Alvás adatok mentve:', sleepData);

    alert('Alvás adatok mentve!');
    
    // Alapállapot visszaállítása (opcionális)
    this.completed = false;
    this.sleepAmount = null;
  }

  openCalendar(): void {
    alert('Naptár funkció még nem elérhető. Későbbi verzióban lesz implementálva.');
  }
}
