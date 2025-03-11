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
  rewardCount: number = 2040; // Hardcoded or fetched separately if needed

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  feedbackQuestions: string[] = [
    "Mennyire volt hasznos az alkalmazás?",
    "Mennyire volt könnyű a használata?",
    "Mennyire elégedett az ügyfélszolgálattal?"
  ];
  feedbackData: number[][] = [
    [5, 8, 15, 20, 12],
    [3, 6, 18, 25, 10],
    [2, 5, 10, 30, 20]
  ];
  feedbackChart: Chart | undefined;
  selectedQuestionIndex: number = 0;

  ngOnInit(): void {
    this.loadDataForMonth(this.selectedMonthIndex);
    this.loadPostsChart();
    this.loadFeedbackChart();
    this.getAllUsers();
    this.fetchCounts();

    setTimeout(() => {
      (document.getElementById('monthSelect') as HTMLSelectElement).selectedIndex = this.selectedMonthIndex;
      (document.getElementById('questionSelect') as HTMLSelectElement).selectedIndex = this.selectedQuestionIndex;
    });
  }

  // Function to fetch the counts of users, challenges, and posts
  fetchCounts(): void {
    // Get the user count
    this.api.getUsers().subscribe((response) => {
      this.userCount = response.count;  // Use response.count to get the count value
      this.initCountUp('userCount', this.userCount);
    });
  
    // Get the challenge count
    this.api.getChallenges().subscribe((response) => {
      this.challengeCount = response.count;  // Use response.count to get the count value
      this.initCountUp('challengeCount', this.challengeCount);
    });
  
    // Get the post count
    this.api.getPosts().subscribe((response) => {
      this.postCount = response.count;  // Use response.count to get the count value
      this.initCountUp('postCount', this.postCount);
    });
  }

  // Function to initialize the CountUp animation
  initCountUp(elementId: string, count: number): void {
    const counter = new CountUp(elementId, count, { duration: 2.5 });
    if (!counter.error) counter.start();
  }

  // Handle the month change event
  onMonthChange(event: Event): void {
    this.selectedMonthIndex = (event.target as HTMLSelectElement).selectedIndex;
    this.loadDataForMonth(this.selectedMonthIndex);
    this.loadPostsChart();
  }

  // Handle the feedback question change event
  onQuestionChange(event: Event): void {
    this.selectedQuestionIndex = (event.target as HTMLSelectElement).selectedIndex;
    this.loadFeedbackChart();
  }

  // Generate random data for the selected month
  loadDataForMonth(monthIndex: number): void {
    this.selectedMonthData = this.generateRandomDataForMonth(monthIndex);
    this.daysInSelectedMonth = this.generateMonthDays(monthIndex);
  }

  // Load the posts chart (line chart)
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

  // Load the feedback chart (bar chart)
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
            data: this.feedbackData[this.selectedQuestionIndex],
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

  // Generate the list of days in the selected month
  generateMonthDays(monthIndex: number): string[] {
    return Array.from({ length: new Date(2025, monthIndex + 1, 0).getDate() }, (_, i) => (i + 1).toString());
  }

  // Generate random data for the selected month
  generateRandomDataForMonth(monthIndex: number): number[] {
    return Array.from({ length: new Date(2025, monthIndex + 1, 0).getDate() }, () => Math.floor(Math.random() * 100) + 1);
  }

  // Fetch all users from the API
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

  // Filter users based on the search query
  get filteredUsers(): User[] {
    return this.searchQuery
      ? this.users.filter(user => user.name?.toLowerCase().includes(this.searchQuery.toLowerCase()))
      : this.users;
  }

  // Handle the search query change
  onSearchChange(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
  }
}
