import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  postsData: number[] = [];  // Véletlenszerű adat generálása
  selectedMonthData: number[] = [];  // Kezdetben az összes adat
  daysInSelectedMonth: string[] = [];  // A hónap napjainak tárolása
  chart: Chart | undefined;  // A Chart objektum
  selectedMonthIndex: number = new Date().getMonth(); 
  // Az aktuális hónap indexe

  ngOnInit(): void {
    console.log('Initial Month Index:', this.selectedMonthIndex); // Debugging log
    this.loadDataForMonth(this.selectedMonthIndex);  
    this.loadChart();  // A grafikon betöltése

    // Alapértelmezett hónap kiválasztása a legördülő menüben
    setTimeout(() => {
      const selectElement = document.getElementById('monthSelect') as HTMLSelectElement;
      if (selectElement) {
        selectElement.selectedIndex = this.selectedMonthIndex;
      }
    });
  }

  onMonthChange(event: Event): void {
    const selectedMonthIndex = (event.target as HTMLSelectElement).selectedIndex;
    this.loadDataForMonth(selectedMonthIndex); 
    this.loadChart();  
  }

  loadDataForMonth(monthIndex: number): void {
    this.selectedMonthData = this.generateRandomDataForMonth(monthIndex);  // A hónaphoz tartozó adatok
    this.daysInSelectedMonth = this.generateMonthDays(monthIndex);  // A hónap napjai
  }

  loadChart(): void {
    const ctx = document.getElementById('postsChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Ha már van meglévő grafikon, azt töröljük
    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.daysInSelectedMonth,  // A hónap napjai
        datasets: [{
          label: 'Bejegyzések száma',
          data: this.selectedMonthData,  // A hónap adatai
          borderColor: '#007bff',
          backgroundColor: 'rgba(0, 123, 255, 0.2)',
          borderWidth: 2,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // A hónap napjait generáló függvény
  generateMonthDays(monthIndex: number): string[] {
    const daysInMonth = new Date(2025, monthIndex + 1, 0).getDate();  // A hónap napjainak száma
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i.toString());  // A napokat generáljuk
    }
    return days;
  }

  // Véletlenszerű adat generálása minden hónapra
  generateRandomData(): number[] {
    const data = [];
    for (let i = 0; i < 12; i++) {
      data.push(Math.floor(Math.random() * 100) + 1);  // Véletlenszerű szám 1 és 100 között
    }
    return data;
  }

  // Adatok generálása a hónaphoz (szükség esetén módosíthatod)
  generateRandomDataForMonth(monthIndex: number): number[] {
    const daysInMonth = new Date(2025, monthIndex + 1, 0).getDate();
    const data = [];
    for (let i = 0; i < daysInMonth; i++) {
      data.push(Math.floor(Math.random() * 100) + 1);  // Véletlenszerű szám 1 és 100 között
    }
    return data;
  }
}
