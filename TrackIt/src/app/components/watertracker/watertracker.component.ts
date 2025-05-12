import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from '../../services/api.service';

interface CalendarEvent {
  id?: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  color?: string;
  selected?: boolean;
  days?: number[]; // Added days property
}

@Component({
  selector: 'app-watertracker',
  standalone: true,
  imports: [CommonModule, FormsModule, MatNativeDateModule, MatDatepickerModule, MatFormFieldModule, MatInputModule],
  templateUrl: './watertracker.component.html',
  styleUrl: './watertracker.component.scss'
})
export class WatertrackerComponent implements OnInit {

  completed = false;
  waterAmount: number | null = null;
  selectedDate: Date = new Date();
  savedEntries: any[] = [];
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();
  weekdays = ['H', 'K', 'Sz', 'Cs', 'P', 'Sz', 'V'];
  months = ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'];
  calendarDays: any[] = [];
  events: CalendarEvent[] = []; // Események

  touchStartX: number = 0;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
  this.generateCalendar();  // Automatikusan generálja a naptárat

  // Teszt események hozzáadása
  this.events = [
    {
      title: 'Példa esemény 1',
      description: 'Ez egy példa esemény.',
      startTime: new Date(this.currentYear, this.currentMonth, 5),
      endTime: new Date(this.currentYear, this.currentMonth, 5),
      color: 'red',
    },
    {
      title: 'Példa esemény 2',
      description: 'Ez egy másik példa esemény.',
      startTime: new Date(this.currentYear, this.currentMonth, 15),
      endTime: new Date(this.currentYear, this.currentMonth, 15),
      color: 'green',
    }
  ];

  // Frissítse a naptárat, hogy a pontok megjelenjenek
  this.generateCalendar();
}

  // Események napjainak megjelenítése
  showDayDetails(day: any): void {
    console.log('Napi részletek:', day);
  }

  // Vízmennyiség mentése
  saveWater() {
    if (!this.waterAmount || this.waterAmount <= 0) {
      alert('Adj meg egy érvényes vízmennyiséget!');
      return;
    }

    const data = {
      date: this.selectedDate.toISOString().split('T')[0],
      achieved: this.completed,
      value: this.waterAmount,
      habitId: 'water-tracker'
    };

    this.apiService.addHabitTrackingRecord(data).subscribe((res) => {
      console.log('Sikeres mentés:', res);
      this.savedEntries.push(data);
      this.waterAmount = null;
      this.completed = false;
    });
  }

  // A hónap naptárának generálása
  generateCalendar() {
  console.log('Generálás előtt', this.calendarDays);
  this.calendarDays = this.createCalendarDays();
  console.log('Generálás után', this.calendarDays);
}
  // A hónap napjainak létrehozása
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

  // Események keresése a napokhoz
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

  // Hónap váltás
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
}
