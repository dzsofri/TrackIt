import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import { CountUp } from 'countup.js';
import { User } from '../../interfaces/user';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { FeedbackQuestion } from '../../interfaces/feedbackQuestions';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  imports: [CommonModule, FormsModule, NgbModule],
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  @ViewChild('userModal') userModal: any; // A modális sablon referenciája
  selectedUser: User | null = null;

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

  noDataMessage: string = ''; // Üzenet, ha nincs adat

  feedbackQuestions: FeedbackQuestion[] = [];
  feedbackData: number[][] = [];
  feedbackChart: Chart | undefined;
  selectedQuestionIndex: number = 0;

  constructor(
    private api: ApiService, 
    private auth: AuthService, 
    private router: Router, 
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.selectedMonthIndex = new Date().getMonth() - 2; // Kiválasztott hónap módosítása
    console.log('selectedMonthIndex az ngOnInit-ban:', this.selectedMonthIndex); // Ellenőrzés

    this.loadDataForMonth(this.selectedMonthIndex); // Hívjuk meg a hónap adatainak betöltését
    this.loadFeedbackQuestions();
    this.loadPostsChart();
    this.loadFeedbackChart();
    this.getAllUsers();
    this.fetchCounts();
  }

  openUserModal(user: User): void {
    this.selectedUser = user; // Beállítjuk a kiválasztott felhasználót
    this.modalService.open(this.userModal); // Megnyitjuk a modált
  }

  onMonthChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newMonthIndex = target.selectedIndex;

    console.log('New selectedMonthIndex:', newMonthIndex); // Hónapváltoztatás ellenőrzése
    if (this.selectedMonthIndex !== newMonthIndex) {
      this.selectedMonthIndex = newMonthIndex;
      console.log('Selected Month Index updated:', this.selectedMonthIndex); // Nyomkövetés
      this.loadDataForMonth(this.selectedMonthIndex); // Hónap adatainak betöltése
      this.loadPostsChart(); // Grafikon frissítése
    }
  }

  loadDataForMonth(monthIndex: number): void {
    const year = new Date().getFullYear();
    this.daysInSelectedMonth = this.generateMonthDays(monthIndex);
    this.noDataMessage = ''; // Reseteljük az üzenetet, hogy ne maradjon ott a régi hibaüzenet
    this.api.getPostsByMonth(monthIndex + 1, year).subscribe({
      next: (response) => {
        if (!response.posts || response.posts.length === 0) {
          console.warn("Nincs adat erre a hónapra.");
          this.noDataMessage = "Nincs adat a kiválasztott hónapra."; // Üzenet, ha nincs adat
          this.selectedMonthData = this.daysInSelectedMonth.map(() => 0); // Ha nincs adat, üres adatot jelenítünk meg
        } else {
          const dailyPostCounts: { [key: string]: number } = {};

          // Inicializáljuk az összes napot nullával
          this.daysInSelectedMonth.forEach(day => {
            dailyPostCounts[day] = 0;
          });

          // Számoljuk meg a posztokat napokra bontva
          response.posts.forEach(post => {
            const postDate = new Date(post.createdAt);
            const day = postDate.getDate().toString();
            if (dailyPostCounts[day] !== undefined) {
              dailyPostCounts[day]++;
            }
          });

          // Az adatokat a Chart.js számára alakítjuk át
          this.selectedMonthData = this.daysInSelectedMonth.map(day => dailyPostCounts[day]);
        }

        this.loadPostsChart();  // Frissítjük a grafikont
      },
      error: (error) => {
        console.error("Hiba a posztok betöltése során:", error);
        this.noDataMessage = "Hiba történt az adatok betöltése során.";  // Hibaüzenet
        this.selectedMonthData = this.daysInSelectedMonth.map(() => 0);  // Ha hiba történt, üres adatot jelenítünk meg
        this.loadPostsChart();  // Frissítjük a grafikont
      }
    });
  }

  loadFeedbackQuestions(): void {
    this.api.getFeedbackQuestions().subscribe({
      next: (response) => {
        this.feedbackQuestions = response.questions;
        this.loadFeedbackData(); 
      },
      error: (err) => {
        console.log('Hiba a kérdések betöltése során:', err);
        this.feedbackQuestions = [];
      }
    });
  }

  loadFeedbackData(): void {
    if (this.feedbackQuestions.length === 0) return;

    const question = this.feedbackQuestions[this.selectedQuestionIndex];
    const questionId = question.id;

    this.api.getFeedbackData(questionId).subscribe({
      next: (response) => {
        this.feedbackData[this.selectedQuestionIndex] = this.getRatings(response);
        this.loadFeedbackChart(); 
      },
      error: () => {
        this.feedbackData[this.selectedQuestionIndex] = [0, 0, 0, 0, 0];
        this.loadFeedbackChart();
      }
    });
  }

  getRatings(response: any): number[] {
    const ratings = ['1', '2', '3', '4', '5'];
    const feedbackCount: Record<string, number> = response.feedbackCount || {};
    return ratings.map(rating => feedbackCount[rating] ?? 0);
  }

  fetchCounts(): void {
    this.api.getAllUsers().subscribe(response => 
      this.initCountUp('userCount', response.users.length));
    
    this.api.getChallenges().subscribe(response => this.initCountUp('challengeCount', response.count));
    this.api.getPosts().subscribe(response => this.initCountUp('postCount', response.count));
  }

  initCountUp(elementId: string, count: number): void {
    new CountUp(elementId, count, { duration: 2.5 }).start();
  }

  onQuestionChange(event: Event): void {
    this.selectedQuestionIndex = (event.target as HTMLSelectElement).selectedIndex;
    this.loadFeedbackData();
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
        this.users = response?.users || [];
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
