import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

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
  selector: 'app-sleeptracker',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDatepickerModule, MatFormFieldModule, MatInputModule],
  templateUrl: './sleeptracker.component.html',
  styleUrl: './sleeptracker.component.scss'
})
export class SleeptrackerComponent {
  sleepCompleted: boolean = false;
  sleepAmount: number | null = null;
  sleepDate: Date = new Date();
  selectedDate: Date = new Date();
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();
  weekdays = ['H', 'K', 'Sz', 'Cs', 'P', 'Sz', 'V'];
  months = ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'];
  calendarDays: any[] = [];
  events: CalendarEvent[] = []; // Események
  touchStartX: number = 0;

  saveSleep(): void {
    if (!this.sleepAmount || this.sleepAmount <= 0) {
      alert('Kérlek, adj meg érvényes alvásmennyiséget!');
      return;
    }

    const sleepEntry = {
      date: this.sleepDate.toISOString().split('T')[0],
      completed: this.sleepCompleted,
      amount: this.sleepAmount
    };

    console.log('Alvás adat mentve:', sleepEntry);
    alert('Alvás adatok mentve!');

    this.sleepCompleted = false;
    this.sleepAmount = null;
  }

  onDateSelected(date: Date): void {
    this.sleepDate = date;
    console.log('Kiválasztott dátum:', date);
  }


  openCalendar(): void {
    alert('A naptár funkció még fejlesztés alatt van.');
  }

showDayDetails(day: any): void {
    console.log('Napi részletek:', day);
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


