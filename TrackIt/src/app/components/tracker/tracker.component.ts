import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../services/message.service';
import { HttpClient } from '@angular/common/http';
import { CustomtrackerComponent } from '../customtracker/customtracker.component';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { NewhabitComponent } from '../newhabit/newhabit.component';
import { Chart } from 'chart.js';

interface CalendarEvent {
  id?: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  color?: string;
  selected?: boolean;
  days?: number[];
}

@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule, NewhabitComponent],
  templateUrl: './tracker.component.html',
  styleUrl: './tracker.component.scss'
})
export class TrackerComponent {
  constructor(
    private api: ApiService,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private message: MessageService,
    private http: HttpClient
  ) {}

  completed = false;
  value: number | null = null;
  unit = 'liter';
  units = ['liter', 'mililiter', 'óra', 'perc', 'méter', 'kilométer'];
  date = new Date().toISOString().split('T')[0];
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();
  weekdays = ['H', 'K', 'Sz', 'Cs', 'P', 'Sz', 'V'];
  months = ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'];
  calendarDays: any[] = [];
  events: CalendarEvent[] = [];
  touchStartX = 0;
  startDate = new Date().toISOString().split('T')[0];
  intervalDays = 1;
  isPopupOpen = false;
  id = '';
  user: any;
  userNames: { [key: string]: string } = {};
  imagePreviewUrl = '/assets/images/profileKep.png';
  activeTab = 'watertracker';
  modalVisible = false;
  modalType: 'error' | 'success' | 'warning' | 'info' = 'info';
  modalMessage = '';
  habitList: { id: string, habitName: string, status: string, targetValue?: number, currentValue?: number }[] = [];
  selectedHabit: { id: string, habitName: string, status: string } | null = null;
  habitChart: Chart | undefined;

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.auth.user$.subscribe(user => {
      if (user) {
        this.id = user.id;
        this.user = { id: user.id };
        this.fetchUser();
        this.fetchHabits();
        this.fetchUserProfilePicture();
        this.generateCalendar();
      }
    });
  }

  fetchUser(): void {
    this.api.getLoggedUser('users', this.id).subscribe({
      next: (res: any) => {
        this.user = res.user;
        if (this.user && this.user.id) {
          this.userNames[this.user.id] = this.user.name ?? 'Ismeretlen felhasználó';
        }
      },
      error: (err) => console.error('Error fetching user data:', err)
    });
  }

  fetchUserProfilePicture(): void {
    const token = localStorage.getItem('trackit');
    if (!token) return;

    this.http.get<{ imageUrl: string | null }>('http://localhost:3000/users/profile-picture', {
      headers: { Authorization: `Bearer ${token}` },
    }).subscribe({
      next: (response) => this.imagePreviewUrl = response.imageUrl || '/assets/images/profileKep.png',
      error: () => this.imagePreviewUrl = '/assets/images/profileKep.png',
    });
  }
fetchHabits(): void {
  const token = localStorage.getItem('trackit');
  if (!token) return;

  this.api.getHabitsForUser(this.id, token).subscribe({
    next: (res: any[]) => {
      // Módosítás a habitList osztályszintű változóra
      this.habitList = res.map(habit => ({
        id: habit.id,
        habitName: habit.habitName,
        status: habit.status,
        targetValue: habit.targetValue,
        currentValue: habit.currentValue 
      }));
      console.log(this.habitList); // Ezt módosítani kell, hogy a helyes listát logolja
      this.loadHabitChart(); // A grafikon frissítése
    },
    error: (err) => console.error('Hiba a szokások betöltésekor:', err)
  });
}

  openNewHabitModal() { this.isPopupOpen = true; }
  closeNewHabitModal() { this.isPopupOpen = false; }

  onHabitChange(): void {
    const selectedHabitData = this.habitList.find(habit => habit.id === this.selectedHabit?.id);
    if (!selectedHabitData) console.error('A kiválasztott szokás nem található!');
  }

  submit(): void {
    if (!this.selectedHabit || this.value === null || !this.startDate || this.intervalDays <= 0) {
      this.modalMessage = 'Kérlek, tölts ki minden mezőt!';
      this.modalType = 'warning';
      this.modalVisible = true;
      return;
    }

    const start = new Date(this.startDate);
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < this.intervalDays; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);

      this.api.addHabitTrackingRecord({
        habitId: this.selectedHabit.id,
        achieved: this.completed,
        value: this.value,
        date: currentDate.toISOString().split('T')[0],
      }).subscribe({
        next: () => {
          successCount++;
          if (successCount + errorCount === this.intervalDays) {
            this.modalMessage = `Sikeresen elmentve ${successCount} napra!`;
            this.modalType = 'success';
            this.modalVisible = true;
          }
        },
        error: () => {
          errorCount++;
          if (successCount + errorCount === this.intervalDays) {
            this.modalMessage = `Mentés során ${errorCount} hiba történt.`;
            this.modalType = 'error';
            this.modalVisible = true;
          }
        }
      });
    }
  }

  handleNewHabit(event: { habit: any }): void {
    this.api.createHabit(event.habit).subscribe({
      next: (res) => {
        this.habitList.push(res.habit);
        this.modalMessage = 'Szokás sikeresen létrehozva!';
        this.modalType = 'success';
        this.modalVisible = true;
        this.loadHabitChart();
      },
      error: () => {
        this.modalMessage = 'Hiba történt a szokás létrehozásakor.';
        this.modalType = 'error';
        this.modalVisible = true;
      }
    });
  }

  activateHabit(): void {
    if (!this.selectedHabit) return;

    const token = localStorage.getItem('trackit');
    if (!token) return;

    const payload = {
      habitId: this.selectedHabit.id,
      habitName: this.selectedHabit.habitName,
      status: 'active',
      userId: this.id
    };

    this.api.updateHabitStatus(payload).subscribe({
      next: () => {
        this.modalMessage = 'A tracker sikeresen aktiválva lett!';
        this.modalType = 'success';
        this.modalVisible = true;
        this.selectedHabit!.status = 'active';
      },
      error: () => {
        this.modalMessage = 'Hiba történt a státusz frissítése közben.';
        this.modalType = 'error';
        this.modalVisible = true;
      }
    });
  }

loadHabitChart(): void {
  const canvas = document.getElementById('habitChart') as HTMLCanvasElement;
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;

  if (this.habitChart) {
    this.habitChart.destroy();
  }

  const habitNames = this.habitList.map(h => h.habitName);
  const currentValues = this.habitList.map(h => h.currentValue ?? 0);

  this.habitChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: habitNames,
      datasets: [{
        label: 'Aktuális érték',
        data: currentValues,
        backgroundColor: '#4e6151'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Érték'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Szokás'
          }
        }
      }
    }
  });
}

deleteHabit(): void {
  if (!this.selectedHabit) return;

  if (confirm('Biztosan törölni szeretnéd ezt a szokást?')) {
    this.api.deleteHabit(this.selectedHabit.id).subscribe({
      next: (response) => {
        if (response.message === 'Szokás sikeresen törölve!') {
          this.habitList = this.habitList.filter(h => h.id !== this.selectedHabit?.id);
          this.selectedHabit = null;
          this.modalMessage = 'Szokás törölve!';
          this.modalType = 'success';
          this.modalVisible = true;
          this.loadHabitChart();
        }
      },
      error: () => {
        this.modalMessage = 'Hiba történt a törlés során.';
        this.modalType = 'error';
        this.modalVisible = true;
      }
    });
  }
}



  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  showDayDetails(day: any): void {
    console.log('Showing details for', day);
  }

  generateCalendar() {
    this.calendarDays = this.createCalendarDays();
  }

  createCalendarDays() {
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const startDay = (firstDayOfMonth.getDay() + 6) % 7;
    const calendarDays = [];
    const prevMonthDays = new Date(this.currentYear, this.currentMonth, 0).getDate();

    for (let i = startDay - 1; i >= 0; i--) {
      calendarDays.push({ date: prevMonthDays - i, inactive: true, dots: [] });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push({ date: i, dots: this.getEventDots(i) });
    }

    while (calendarDays.length < 42) {
      calendarDays.push({ date: calendarDays.length - daysInMonth - startDay + 1, inactive: true, dots: [] });
    }

    return calendarDays;
  }

  getEventDots(day: number) {
    const currentDate = new Date(this.currentYear, this.currentMonth, day);
    currentDate.setHours(0, 0, 0, 0);
    return this.events
      .filter(event => {
        const eventStart = new Date(event.startTime);
        const eventEnd = new Date(event.endTime);
        eventStart.setHours(0, 0, 0, 0);
        eventEnd.setHours(0, 0, 0, 0);
        return eventStart <= currentDate && currentDate <= eventEnd;
      })
      .map(event => ({
        title: event.title,
        color: event.color ?? 'deepskyblue',
        isStart: new Date(event.startTime).getTime() === currentDate.getTime(),
        isEnd: new Date(event.endTime).getTime() === currentDate.getTime()
      }));
  }

  prevMonth() {
    this.changeMonth(-1);
    this.generateCalendar();
  }

  nextMonth() {
    this.changeMonth(1);
    this.generateCalendar();
  }

  changeMonth(direction: number) {
    if (this.currentMonth === 0 && direction === -1) {
      this.currentMonth = 11;
      this.currentYear--;
    } else if (this.currentMonth === 11 && direction === 1) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth += direction;
    }
  }

  onTouchStart(event: TouchEvent, day: any) {
    this.touchStartX = event.touches[0].clientX;
  }

  onTouchEnd(event: TouchEvent, day: any) {
    const touchEndX = event.changedTouches[0].clientX;
    if (this.touchStartX - touchEndX > 50) {
      this.deleteEventFromDay(day);
    }
  }

  deleteEventFromDay(day: any) {
    // optional: implement deletion
  }
}
