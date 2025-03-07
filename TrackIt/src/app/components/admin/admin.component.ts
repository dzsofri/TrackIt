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
    const canvas = document.getElementById('postsChart') as HTMLCanvasElement;
    if (!canvas) return;
  
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    // Tüskés vonal gradient háttérrel
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(40, 167, 69, 0.6)');
    gradient.addColorStop(1, 'rgba(40, 167, 69, 0)');
  
    if (this.chart) {
      this.chart.destroy();
    }
  
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.daysInSelectedMonth,
        datasets: [{
          label: 'Postok',
          data: this.selectedMonthData,
          borderColor: '#28a745', // Tüskés zöld vonal
          borderWidth: 2,
          backgroundColor: gradient,
          fill: true, 
          tension: 0,  // Ez teszi tüskéssé a vonalat
          pointRadius: 2, // Láthatóbb pontok
          pointBackgroundColor: '#28a745', // Pontok színe
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
