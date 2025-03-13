import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import { CountUp } from 'countup.js';
import { User } from '../../interfaces/user';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  selectedMonthData: number[] = [];
  daysInSelectedMonth: string[] = [];
  postsChart: Chart | undefined;
  selectedMonthIndex: number = new Date().getMonth();
  users: User[] = [];
  searchQuery: string = '';

  userCount: number = 0;
  challengeCount: number = 0;
  postCount: number = 0;
  rewardCount: number = 2040;

  feedbackQuestions: string[] = [];
  feedbackData: number[][] = [];
  feedbackChart: Chart | undefined;
  selectedQuestionIndex: number = 0;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFeedbackQuestions();
    this.loadFeedbackData();
    this.loadDataForMonth(this.selectedMonthIndex);
    this.loadPostsChart();
    this.loadFeedbackChart();
    this.getAllUsers();
    this.fetchCounts();
  }

  loadFeedbackQuestions(): void {
    this.api.getFeedbackQuestions().subscribe({
      next: (response) => {
        // Ellenőrizzük, hogy az ID-ket külön kell kérni
        this.feedbackQuestions = response.questions.map(f => f.question);
        console.log('Kérdések betöltve:', this.feedbackQuestions);
        console.log('Kérdés ID-k:', response.questions.map((q, index) => index + 1)); // Az ID-kat megjelenítjük, hogy az index alapján lekérhessük
      },
      error: (err) => {
        console.log('Hiba a kérdések betöltése során:', err);
        this.feedbackQuestions = [];
      }
    });
  }
  
  
  loadFeedbackData(): void {
    if (this.feedbackQuestions.length === 0) {
      console.log('Nincsenek kérdések, nem tölthető be az adat!');
      return;
    }
  
    const questionId = this.selectedQuestionIndex + 1;  // A kiválasztott kérdés ID-ja
    console.log('Kérdés ID:', questionId);  // Ellenőrizzük, hogy az ID helyes-e
  
    this.api.getFeedbackData(questionId).subscribe({
      next: (response) => {
        console.log('Válasz érkezett:', response);
        if (response.feedbackCount) {
          const feedbackCount: Record<string, number> = response.feedbackCount;
          const ratings = ['1', '2', '3', '4', '5'];  // Az értékelési skála
          this.feedbackData[this.selectedQuestionIndex] = ratings.map(rating => feedbackCount[rating] ?? 0);
        } else {
          this.feedbackData[this.selectedQuestionIndex] = [0, 0, 0, 0, 0];
        }
  
        console.log('Frissített feedbackData:', this.feedbackData);
        this.loadFeedbackChart();  // Frissítjük a grafikont
      },
      error: (error) => {
        console.log('Hiba a válasz betöltésében:', error);
        this.feedbackData[this.selectedQuestionIndex] = [0, 0, 0, 0, 0];
        this.loadFeedbackChart();
      }
    });
  }
  
  
  
  
  

  fetchCounts(): void {
    this.api.getUsers().subscribe((response) => {
      this.userCount = response.count;
      this.initCountUp('userCount', this.userCount);
    });

    this.api.getChallenges().subscribe((response) => {
      this.challengeCount = response.count;
      this.initCountUp('challengeCount', this.challengeCount);
    });

    this.api.getPosts().subscribe((response) => {
      this.postCount = response.count;
      this.initCountUp('postCount', this.postCount);
    });
  }

  initCountUp(elementId: string, count: number): void {
    const counter = new CountUp(elementId, count, { duration: 2.5 });
    if (!counter.error) counter.start();
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
    const ctx = canvas?.getContext('2d');
    if (ctx) {
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
          scales: { y: { beginAtZero: true } }
        }
      });
    }
  }

  loadFeedbackChart(): void {
    const canvas = document.getElementById('feedbackChart') as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d');
  
    if (ctx) {
      if (this.feedbackChart) {
        this.feedbackChart.destroy();
      }
  
      this.feedbackChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['1', '2', '3', '4', '5'],
          datasets: [{
            label: 'Felhasználói értékelések',
            data: this.feedbackData[this.selectedQuestionIndex] || [0, 0, 0, 0, 0],
            backgroundColor: ['#28a745']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true }, x: { beginAtZero: true } }
        }
      });
    }
  }
  
  


  generateMonthDays(monthIndex: number): string[] {
    return Array.from({ length: new Date(2025, monthIndex + 1, 0).getDate() }, (_, i) => (i + 1).toString());
  }

  generateRandomDataForMonth(monthIndex: number): number[] {
    return Array.from({ length: new Date(2025, monthIndex + 1, 0).getDate() }, () => Math.floor(Math.random() * 100) + 1);
  }

  getAllUsers(): void {
    this.api.getAllUsers().subscribe({
      next: (response) => {
        if (response && Array.isArray(response.users)) {
          this.users = response.users;
        } else {
          this.users = [];
        }
      },
      error: () => {
        this.users = [];
      }
    });
  }

  get filteredUsers(): User[] {
    return this.searchQuery
      ? this.users.filter(user => user.name?.toLowerCase().includes(this.searchQuery.toLowerCase()))
      : this.users;
  }

  onSearchChange(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
  }
}
