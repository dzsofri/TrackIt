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

interface CalendarEvent {
  id?: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  color?: string;
  selected?: boolean;
  days?: number[]; // <-- Added days property
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

  completed: boolean = false;
  value: number | null = null;
  unit: string = 'liter';
  units: string[] = ['liter', 'mililiter', 'óra', 'perc', 'méter', 'kilométer'];
  date: string = new Date().toISOString().split('T')[0];
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();
  weekdays = ['H', 'K', 'Sz', 'Cs', 'P', 'Sz', 'V'];
  months = ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'];
  calendarDays: any[] = [];
  events: CalendarEvent[] = [];
  touchStartX: number = 0;
  startDate: string = new Date().toISOString().split('T')[0];
  intervalDays: number = 1;
 isPopupOpen: boolean = false; // Hozzáadva az állapot a modális ablakhoz



  id: string = '';
  user: any;
  userNames: { [key: string]: string } = {};
  imagePreviewUrl: string = '/assets/images/profileKep.png';

  activeTab: string = 'watertracker';
  modalVisible = false;
  modalType: 'error' | 'success' | 'warning' | 'info' = 'info';
  modalMessage = '';

  habitList: { id: string, habitName: string }[] = [];

  selectedHabit: { id: string, habitName: string, status: string } | null = null;

openNewHabitModal() {
    this.isPopupOpen = true;
  }

  closeNewHabitModal() {
    this.isPopupOpen = false;
  }

  
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
      error: (err) => {
        console.error('Error fetching user data:', err);
      }
    });
  }

  fetchUserProfilePicture(): void {
    const token = localStorage.getItem('trackit');
    if (!token) {
      console.error('No valid token found!');
      return;
    }

    this.http.get<{ imageUrl: string | null }>('http://localhost:3000/users/profile-picture', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).subscribe({
      next: (response) => {
        this.imagePreviewUrl = response.imageUrl || '/assets/images/profileKep.png';
      },
      error: (error) => {
        console.error('Error fetching profile picture:', error);
        this.imagePreviewUrl = '/assets/images/profileKep.png';
      },
    });
  }

 fetchHabits(): void {
  const token = localStorage.getItem('trackit');
  if (!token) {
    console.error('Nincs érvényes token!');
    return;
  }

  this.api.getHabitsForUser(this.id, token).subscribe({
    next: (res: any[]) => {
      console.log(res)
      // Itt most az objektumokat tároljuk
      this.habitList = res.map(habit => ({
        id: habit.id,
        habitName: habit.habitName,
        status: habit.status // hozzáadjuk a státuszt is
      }));

    },
    error: (err) => {
      console.error('Hiba a szokások betöltésekor:', err); // Itt nézd meg a konzolon a teljes hibát
    }
  });
}



  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

onHabitChange(): void {
  // Kiválasztott habit keresése a habitList-ben
  const selectedHabitData = this.habitList.find(habit => habit.id === this.selectedHabit?.id);


  if (selectedHabitData) {
    console.log('Kiválasztott tracker:', selectedHabitData);
    // Itt folytathatod a kiválasztott habit adatainak használatát
  } else {
    console.error('A kiválasztott szokás nem található!');
  }
}


  submit(): void {
  if (!this.selectedHabit) {
    console.error('Nincs kiválasztott szokás!');
    return;
  }

  const start = new Date(this.startDate);
  const payloads = [];

  for (let i = 0; i < this.intervalDays; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);

    const payload = {
      habitName: this.selectedHabit.habitName,
      completed: this.completed,
      value: this.value,
      unit: this.unit,
      date: currentDate.toISOString().split('T')[0],
      userId: this.id
    };

    payloads.push(payload);
  }

  let successCount = 0;
  let errorCount = 0;




  payloads.forEach((payload, index) => {
    this.api.saveHabitEntry(payload).subscribe({
      next: () => {
        successCount++;
        if (successCount + errorCount === payloads.length) {
          this.modalMessage = `Sikeresen elmentve ${successCount} napra!`;
          this.modalType = 'success';
          this.modalVisible = true;
        }
      },
      error: () => {
        errorCount++;
        if (successCount + errorCount === payloads.length) {
          this.modalMessage = `Mentés során ${errorCount} hiba történt.`;
          this.modalType = 'error';
          this.modalVisible = true;
        }
      }
    });
  });
}

handleNewHabit(event: { habit: any }): void {
  this.api.createHabit(event.habit).subscribe({
    next: (res) => {
      this.habitList.push(res.habit);
      // opcionálisan ide jöhet visszajelzés vagy modal megjelenítése
    },
    error: () => {
      // ide jöhet hiba visszajelzés
    }
  });
}



activateHabit(): void {
  if (!this.selectedHabit) {
    console.error('Nincs kiválasztva szokás!');
    return;
  }

  const token = localStorage.getItem('trackit');
  if (!token) {
    console.error('Nincs érvényes token!');
    return;
  }

  const payload = {
    habitId: this.selectedHabit.id,
    habitName: this.selectedHabit.habitName,
    status: 'active',
    userId: this.id
  };

  this.api.updateHabitStatus(payload).subscribe({
    next: (response) => {
      console.log('Tracker státusz sikeresen frissítve:', response);
      this.modalMessage = 'A tracker sikeresen aktiválva lett!';
      this.modalType = 'success';
      this.modalVisible = true;

      // Frissítsük a selectedHabit státuszát
      this.selectedHabit!.status = 'active';
    },
    error: (err) => {
      console.error('Hiba a tracker státusz frissítésekor:', err);
      this.modalMessage = 'Hiba történt a státusz frissítése közben.';
      this.modalType = 'error';
      this.modalVisible = true;
    }
  });
}



  showDayDetails(day: any): void {
  console.log('Showing details for', day);
  // Implement your logic here
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
    .map(event => {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      return {
        title: event.title,
        color: event.color ?? 'deepskyblue',
        isStart: start.getTime() === currentDate.getTime(),
        isEnd: end.getTime() === currentDate.getTime()
      };
    });
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

// Swipe delete helpers (optional)
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
  // optional: handle deletion logic here
}




};

