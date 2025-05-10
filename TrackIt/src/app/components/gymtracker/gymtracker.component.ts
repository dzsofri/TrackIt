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
  selector: 'app-gymtracker',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDatepickerModule, MatFormFieldModule, MatInputModule],
  templateUrl: './gymtracker.component.html',
  styleUrl: './gymtracker.component.scss'
})
export class GymtrackerComponent {
  touchStartX: number = 0;
  gymCompleted: boolean = false;
  gymAmount: number | null = null;
  gymDate: Date = new Date();
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();
  weekdays = ['H', 'K', 'Sz', 'Cs', 'P', 'Sz', 'V'];
  months = ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'];
  calendarDays: any[] = [];
  events: CalendarEvent[] = [];

  saveGym(): void {
    if (!this.gymAmount || this.gymAmount <= 0) {
      alert('Kérlek adj meg érvényes edzésmennyiséget!');
      return;
    }

    const gymEntry = {
      date: this.gymDate.toISOString().split('T')[0],
      completed: this.gymCompleted,
      amount: this.gymAmount
    };

    console.log('Edzés adat mentve:', gymEntry);
    alert('Edzés adatok elmentve!');

    this.gymCompleted = false;
    this.gymAmount = null;
  }


  generateCalendar() {
  this.calendarDays = this.createCalendarDays();
}

showDayDetails(day: any): void {
  console.log('Showing details for', day);
  // Implement your logic here
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
} 