import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import { CountUp } from 'countup.js'; 

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  
  // Hónapok és posztadatok
  months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  selectedMonthData: number[] = [];  
  daysInSelectedMonth: string[] = [];  
  postsChart: Chart | undefined;  
  selectedMonthIndex: number = new Date().getMonth();

  // Visszajelzési adatok (1-5 skála)
  feedbackQuestions: string[] = [
    "Mennyire volt hasznos az alkalmazás?",
    "Mennyire volt könnyű a használata?",
    "Mennyire elégedett az ügyfélszolgálattal?"
  ];
  feedbackData: number[][] = [
    [5, 8, 15, 20, 12], // 1. kérdés: 1-től 5-ig kapott értékelések darabszáma
    [3, 6, 18, 25, 10], // 2. kérdés
    [2, 5, 10, 30, 20]  // 3. kérdés
  ];
  feedbackChart: Chart | undefined;
  selectedQuestionIndex: number = 0;

  
  initCountUp(): void {
    // Felhasználói szám animálása
    const userCount = new CountUp('userCount', 40689, { duration: 2.5 });
    if (!userCount.error) userCount.start();
  
    // Kihívások szám animálása
    const challengeCount = new CountUp('challengeCount', 10293, { duration: 2.5 });
    if (!challengeCount.error) challengeCount.start();
  
    // Bejegyzések szám animálása
    const postCount = new CountUp('postCount', 14562, { duration: 2.5 });
    if (!postCount.error) postCount.start();
  
    // Jutalom szám animálása
    const rewardCount = new CountUp('rewardCount', 2040, { duration: 2.5 });
    if (!rewardCount.error) rewardCount.start();
  }
  
  ngOnInit(): void {
    this.loadDataForMonth(this.selectedMonthIndex);
    this.loadPostsChart();
    this.loadFeedbackChart();
    this.initCountUp()
    setTimeout(() => {
      (document.getElementById('monthSelect') as HTMLSelectElement).selectedIndex = this.selectedMonthIndex;
      (document.getElementById('questionSelect') as HTMLSelectElement).selectedIndex = this.selectedQuestionIndex;
    });
  }

  onMonthChange(event: Event): void {
    this.selectedMonthIndex = (event.target as HTMLSelectElement).selectedIndex;
    this.loadDataForMonth(this.selectedMonthIndex);
    this.loadPostsChart();
  }

  onQuestionChange(event: Event): void {
    this.selectedQuestionIndex = (event.target as HTMLSelectElement).selectedIndex;
    this.loadFeedbackChart();
  }

  loadDataForMonth(monthIndex: number): void {
    this.selectedMonthData = this.generateRandomDataForMonth(monthIndex);
    this.daysInSelectedMonth = this.generateMonthDays(monthIndex);
  }

  loadPostsChart(): void {
    const canvas = document.getElementById('postsChart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    if (this.postsChart) {
      this.postsChart.destroy();
    }
  
    this.postsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.daysInSelectedMonth,
        datasets: [{
          label: 'Postok',
          data: this.selectedMonthData,
          borderColor: '#28a745',
          borderWidth: 2,
          backgroundColor: 'rgba(40, 167, 69, 0.2)',
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } },
        animation: {
          duration: 900,  // Duration of animation in ms
          easing: 'easeInOutQuart', // Easing function for a smooth effect
          onComplete: function () {
            console.log('Animation Complete!');
          }
        }
      }
    });
  }
  
  loadFeedbackChart(): void {
    const canvas = document.getElementById('feedbackChart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    if (this.feedbackChart) {
      this.feedbackChart.destroy();
    }
  
    this.feedbackChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['1', '2', '3', '4', '5'],  // 1-től 5-ig skála
        datasets: [{
          label: 'Felhasználói értékelések',
          data: this.feedbackData[this.selectedQuestionIndex],
          backgroundColor: ['#28a745']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 5
            }
          }
        },
        animation: {
          duration: 900,  // Duration of animation in ms
          easing: 'easeInOutCubic', // A smooth cubic easing
          onComplete: function () {
            console.log('Feedback chart animation complete!');
          }
        }
      }
    });
  }
  
  

  generateMonthDays(monthIndex: number): string[] {
    return Array.from({ length: new Date(2025, monthIndex + 1, 0).getDate() }, (_, i) => (i + 1).toString());
  }

  generateRandomDataForMonth(monthIndex: number): number[] {
    return Array.from({ length: new Date(2025, monthIndex + 1, 0).getDate() }, () => Math.floor(Math.random() * 100) + 1);
  }
}
