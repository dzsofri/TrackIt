import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ColorPickerModule } from 'primeng/colorpicker';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { DayDetailsModalComponent } from '../day-details-modal/day-details-modal.component';
import { AuthService } from '../../services/auth.service';
import { HaviPlannerKezeloComponent } from '../havi-planner-kezelo/havi-planner-kezelo.component';

@Component({
  selector: 'app-havi-planner',
  standalone: true,
  imports: [CommonModule, FormsModule, ColorPickerModule, DayDetailsModalComponent, AlertModalComponent],
  templateUrl: './havi-planner.component.html',
  styleUrls: ['./havi-planner.component.scss']
})
export class HaviPlannerComponent {
  // View-related properties
  startDateType: string = 'text';
  endDateType: string = 'text';
  modalVisible = false;
  modalType: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalMessage = '';
  invalidFields: string[] = [];
  weekdays = ['H', 'K', 'Sz', 'Cs', 'P', 'Sz', 'V'];
  months = ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'];

  // Calendar-related properties
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();
  calendarDays: any[] = [];
  eventRows: any[][] = [];

  // Event-related properties
  events: any[] = [];
  editingEvent: any = null;
  newEvent = {
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    color: '#ff0000' // alapértelmezett szín (piros)
  };
  selectMode: boolean = false;
  eventss = [
    { name: 'Meeting', startTime: new Date(), endTime: new Date(), color: '#f00', selected: false },
    { name: 'Webinar', startTime: new Date(), endTime: new Date(), color: '#0f0', selected: false },
  ];

  legends = [
    { color: 'deepskyblue', label: '30 napos víz kihívás' },
    { color: 'mediumseagreen', label: 'Történelem beadandó' },
    { color: 'red', label: 'Vizsganap' },
  ];

  // UI State
  visibleWeekdayStartIndex = 0;
  currentSidebarView: 'add' | 'list' = 'add';
  userId = '';
  dayDetailsVisible: boolean = false;
  selectedDay: any = null;
  
  // Lifecycle hooks
  loading: boolean = true;

  constructor(private apiService: ApiService, private authService: AuthService) {}

  ngOnInit() {
    this.initializeUser();
  }


  
  // Helper Methods for Calendar generation
  generateCalendar() {
    this.calendarDays = this.createCalendarDays();
    this.eventRows = this.calculateEventRows();
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

  get visibleWeekdays() {
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

  // Modal handling methods
  showDayDetails(day: any): void {
    this.selectedDay = day;
    this.dayDetailsVisible = true;
  }

  toggleSelection(event: any) {
    event.selected = !event.selected;
  }

  toggleSelectMode() {
    this.selectMode = !this.selectMode;
    if (!this.selectMode) {
      this.eventss.forEach(event => event.selected = false);
    }
  }

  // User-related methods
  private initializeUser() {
    const user = this.authService.loggedUser();
    this.userId = user.id;
  
    if (this.userId) {
      // Fetch all events and filter by userId
      this.apiService.getEvents().subscribe(events => {
        this.loading = false;
        if (events.length > 0) {
          this.events = events.filter(event => event.userId === this.userId); // Filter events by userId
          this.generateCalendar();
          console.log('Események:', this.events);
          console.log('User ID:', this.userId);
          console.log('Események száma:', this.events.length);
        } else {
          console.log('Nincsenek események');
        }
      });
    } else {
      this.loading = false;
      console.error('Nincs felhasználói azonosító');
    }
  }
  

  // Event-related Methods
  addEvent() {
    this.invalidFields = [];
    this.validateNewEvent();

    if (this.invalidFields.length > 0) {
      this.modalMessage = `Kérlek töltsd ki a következő mezőket helyesen: ${this.invalidFields.join(', ')}`;
      this.modalType = 'error';
      this.modalVisible = true;
      return;
    }

    const startDate = new Date(this.newEvent.startTime);
    const startTime = startDate.toISOString();
    const endDate = new Date(this.newEvent.endTime);
    const endTime = endDate.toISOString();

    if (startDate > endDate) {
      this.modalMessage = 'A kezdési időpont nem lehet később, mint a befejezés!';
      this.modalType = 'error';
      this.modalVisible = true;
      return;
    }

    if (this.editingEvent && this.editingEvent.id) {
      this.updateEvent(startTime, endTime);
      return;
    }

    this.createEvent(startTime, endTime);
  }

  resetNewEventForm() {
    this.newEvent = { name: '', description: '', startTime: '', endTime: '', color: '#ff0000' };
    this.editingEvent = null;
  }

  validateNewEvent() {
    if (!this.newEvent.name) this.invalidFields.push('Név');
    if (!this.newEvent.startTime) this.invalidFields.push('Kezdés dátuma');
    if (!this.newEvent.endTime) this.invalidFields.push('Befejezés dátuma');
    if (this.newEvent.startTime && this.newEvent.startTime.length <= 10) this.invalidFields.push('Kezdés időpont (óra:perc is szükséges)');
    if (this.newEvent.endTime && this.newEvent.endTime.length <= 10) this.invalidFields.push('Befejezés időpont (óra:perc is szükséges)');
  }

  createEvent(startTime: string, endTime: string) {
    this.apiService.createEvent({
      title: this.newEvent.name,
      description: this.newEvent.description,
      startTime,
      endTime,
      color: this.newEvent.color
    }).subscribe({
      next: (response) => {
        if (response.message === 'Esemény létrehozva.') {
          this.modalMessage = 'Esemény sikeresen hozzáadva';
          this.modalType = 'success';
          this.modalVisible = true;
          this.events.push(response.event);
          this.generateCalendar();
          this.resetNewEventForm();
        } else {
          this.modalMessage = 'Hiba történt az esemény hozzáadásakor.';
          this.modalType = 'error';
          this.modalVisible = true;
        }
      },
      error: (err) => {
        this.modalMessage = 'Szerverhiba: nem sikerült az eseményt elmenteni.';
        this.modalType = 'error';
        this.modalVisible = true;
        console.error(err);
      }
    });
  }

  updateEvent(startTime: string, endTime: string) {
    this.apiService.updateEvent(this.editingEvent.id, {
      title: this.newEvent.name,
      description: this.newEvent.description,
      startTime,
      endTime,
    }).subscribe({
      next: (response) => {
        this.modalMessage = 'Esemény sikeresen frissítve.';
        this.modalType = 'success';
        this.modalVisible = true;
        this.updateEventInList(response);
      },
      error: (err) => {
        this.modalMessage = 'Nem sikerült frissíteni az eseményt.';
        this.modalType = 'error';
        this.modalVisible = true;
        console.error(err);
      }
    });
  }

  updateEventInList(updatedEvent: any) {
    const index = this.events.findIndex(e => e.id === updatedEvent.id);
    if (index !== -1) {
      this.events[index] = updatedEvent;
      this.generateCalendar();
    }
  }

  // Helper Methods for Event Rows Calculation
  calculateEventRows() {
    const rows: any[][] = [];

    for (const event of this.events) {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      const eventDays = this.getEventDays(start, end);

      let placed = false;
      for (const row of rows) {
        const overlaps = row.some((e: any) => {
          const es = new Date(e.startTime);
          const ee = new Date(e.endTime);
          return (start <= ee && end >= es);
        });

        if (!overlaps) {
          row.push({ ...event, days: eventDays });
          placed = true;
          break;
        }
      }

      if (!placed) {
        rows.push([{ ...event, days: eventDays }]);
      }
    }

    return rows;
  }

  getEventDays(start: Date, end: Date) {
    const eventDays = [];
    let current = new Date(start);

    while (current <= end) {
      if (current.getMonth() === this.currentMonth && current.getFullYear() === this.currentYear) {
        eventDays.push(current.getDate());
      }
      current.setDate(current.getDate() + 1);
    }

    return eventDays;
  }

  // Calendar Days generation method
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
      const eventsForDay = this.getEventDots(i);
      calendarDays.push({ date: i, dots: eventsForDay });
    }

    while (calendarDays.length < 42) {
      calendarDays.push({ date: calendarDays.length - daysInMonth - startDay + 1, inactive: true, dots: [] });
    }

    return calendarDays;
  }

  getEventDots(day: number) {
    const currentDate = new Date(this.currentYear, this.currentMonth, day);
    currentDate.setHours(0, 0, 0, 0);

    return this.events.filter(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      return eventStart <= currentDate && currentDate <= eventEnd;
    }).map(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      const isStart = eventStart.toDateString() === currentDate.toDateString();
      const isEnd = eventEnd.toDateString() === currentDate.toDateString();
      return {
        title: event.title,
        color: event.color || 'deepskyblue',
        isStart,
        eventStart,
        eventEnd,
        isEnd,
      };
    });
  }
}
