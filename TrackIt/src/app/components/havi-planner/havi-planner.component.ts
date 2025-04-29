import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ColorPickerModule } from 'primeng/colorpicker';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { DayDetailsModalComponent } from '../day-details-modal/day-details-modal.component';
import { AuthService } from '../../services/auth.service';

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
  selectedEvents = []; 

  // Event-related properties
  events: any[] = [];
  eventss: any[] = []; // Betöltés adatbázisból
  editingEvent: any = null;
  newEvent = {
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    color: '#ff0000'
  };

  legends = [
    { color: 'deepskyblue', label: '30 napos víz kihívás' },
    { color: 'mediumseagreen', label: 'Történelem beadandó' },
    { color: 'red', label: 'Vizsganap' },
  ];

  // UI State
  selectMode: boolean = false;
  visibleWeekdayStartIndex = 0;
  currentSidebarView: 'add' | 'list' = 'add';
  userId = '';
  dayDetailsVisible: boolean = false;
  selectedDay: any = null;
  loading: boolean = true;

  constructor(private apiService: ApiService, private authService: AuthService) {}

  ngOnInit() {
    this.initializeUser();
  }

  // User initialization + Event fetch
  private initializeUser() {
    const user = this.authService.loggedUser();
    this.userId = user.id;

    if (this.userId) {
      this.apiService.getEvents().subscribe(events => {
        this.loading = false;
        const filteredEvents = events.filter(event => event.userId === this.userId);
        if (filteredEvents.length > 0) {
          this.events = filteredEvents;
          this.eventss = filteredEvents.map(event => ({
            name: event.title,
            startTime: new Date(event.startTime),
            endTime: new Date(event.endTime),
            color: event.color || '#000000',
            selected: false
          }));
          this.generateCalendar();
        } else {
          console.log('Nincsenek események');
        }
      });
    } else {
      this.loading = false;
      console.error('Nincs felhasználói azonosító');
    }
  }

  // Calendar generation
  generateCalendar() {
    this.calendarDays = this.createCalendarDays();
    this.eventRows = this.calculateEventRows();
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
        isEnd,
        eventStart,
        eventEnd
      };
    });
  }

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

  // Navigation
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
  editSelectedEvent() {
    if (this.selectedEvents.length === 1) {
      const event = this.selectedEvents[0];
      // Esemény szerkesztésének logikája, pl. egy modal megnyitása
      console.log('Szerkesztés:', event);
    }
  }
  // Event form handling
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
    const endDate = new Date(this.newEvent.endTime);

    if (startDate > endDate) {
      this.modalMessage = 'A kezdési időpont nem lehet később, mint a befejezés!';
      this.modalType = 'error';
      this.modalVisible = true;
      return;
    }

    const startTime = startDate.toISOString();
    const endTime = endDate.toISOString();

    if (this.editingEvent && this.editingEvent.id) {
      this.updateEvent(startTime, endTime);
      return;
    }

    this.createEvent(startTime, endTime);
  }

  validateNewEvent() {
    if (!this.newEvent.name) this.invalidFields.push('Név');
    if (!this.newEvent.startTime) this.invalidFields.push('Kezdés dátuma');
    if (!this.newEvent.endTime) this.invalidFields.push('Befejezés dátuma');
    if (this.newEvent.startTime && this.newEvent.startTime.length <= 10) this.invalidFields.push('Kezdés időpont (óra:perc is szükséges)');
    if (this.newEvent.endTime && this.newEvent.endTime.length <= 10) this.invalidFields.push('Befejezés időpont (óra:perc is szükséges)');
  }

  createEvent(startTime: string, endTime: string) {
    const user = this.authService.loggedUser(); // Minden híváskor újra lekérni
    const userId = user.id; // A helyes userId közvetlen lekérése
    
    console.log('User ID:', userId);
  
    this.apiService.createEvent({
      title: this.newEvent.name,
      description: this.newEvent.description,
      startTime,
      endTime,
      color: this.newEvent.color,
      userId: userId // Az aktuálisan lekért userId használata
    })
    .subscribe({
      next: (response) => {
        if (response.message === 'Esemény létrehozva.') {
          this.modalMessage = 'Esemény sikeresen hozzáadva';
          this.modalType = 'success';
          this.modalVisible = true;
          this.events.push(response.event);
          this.eventss.push({
            name: response.event.title,
            startTime: new Date(response.event.startTime),
            endTime: new Date(response.event.endTime),
            color: response.event.color || '#000000',
            selected: false
          });
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

  resetNewEventForm() {
    this.newEvent = { name: '', description: '', startTime: '', endTime: '', color: '#ff0000' };
    this.editingEvent = null;
  }

  // Selection Mode
  toggleSelectMode() {
    this.selectMode = !this.selectMode;
    if (!this.selectMode) {
      this.eventss.forEach(event => event.selected = false);
    }
  }

  toggleSelection(event: any) {
    event.selected = !event.selected;
  }

  showDayDetails(day: any): void {
    this.selectedDay = day;
    this.dayDetailsVisible = true;
  }
}
