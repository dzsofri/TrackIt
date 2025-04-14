import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-havi-planner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './havi-planner.component.html',
  styleUrls: ['./havi-planner.component.scss']
})
export class HaviPlannerComponent {
  startDateType: string = 'text';
endDateType: string = 'text';

  weekdays = ['H', 'K', 'Sz', 'Cs', 'P', 'Sz', 'V'];
  months = [
    'Január', 'Február', 'Március', 'Április', 'Május', 'Június',
    'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'
  ];

  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();

  newEvent = {
    name: '',
    startDate: '',
    endDate: '',
  };

  calendarDays: any[] = [];

  legends = [
    { color: 'deepskyblue', label: '30 napos víz kihívás' },
    { color: 'mediumseagreen', label: 'Történelem beadandó' },
    { color: 'red', label: 'Vizsganap' },
  ];

  ngOnInit() {
    this.generateCalendar();
  }

  generateCalendar() {
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const startDay = (firstDayOfMonth.getDay() + 6) % 7; // hétfő az első nap

    this.calendarDays = [];

    // Előző hónap napjai kitöltéshez (ha kell)
    const prevMonthDays = new Date(this.currentYear, this.currentMonth, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      this.calendarDays.push({
        date: prevMonthDays - i,
        inactive: true,
        dots: [],
      });
    }

    // Aktuális hónap napjai
    for (let i = 1; i <= daysInMonth; i++) {
      this.calendarDays.push({
        date: i,
        dots: [],
        label: i === 9 && this.currentMonth === 6 ? 'nyaralás 2025' : i === 25 ? 'vizsga' : null,
      });
    }

    // Kitöltés a hónap végéig (42 elem legyen)
    while (this.calendarDays.length < 42) {
      this.calendarDays.push({
        date: this.calendarDays.length - daysInMonth - startDay + 1,
        inactive: true,
        dots: [],
      });
    }

    // Példa pontok hozzáadása (csak teszthez)
    if (this.currentMonth === 6) { // Július
      this.calendarDays[3].dots.push({ color: 'red' });
      this.calendarDays[3].dots.push({ color: 'blue' });
      this.calendarDays[3].dots.push({ color: 'green' });

      this.calendarDays[8].dots.push({ color: 'red' });
      this.calendarDays[8].dots.push({ color: 'yellow' });
    }
  }

  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }

  addEvent() {
    console.log(this.newEvent);
  }

  visibleWeekdayStartIndex = 0;

get visibleWeekdays() {
  // Mobilon csak 3-at mutatunk, egyébként az összeset
  return window.innerWidth <= 500
    ? this.weekdays.slice(this.visibleWeekdayStartIndex, this.visibleWeekdayStartIndex + 3)
    : this.weekdays;
}

nextWeekdaySet() {
  if (this.visibleWeekdayStartIndex + 3 < this.weekdays.length) {
    this.visibleWeekdayStartIndex += 3;
  }
}

prevWeekdaySet() {
  if (this.visibleWeekdayStartIndex - 3 >= 0) {
    this.visibleWeekdayStartIndex -= 3;
  }
}

}
