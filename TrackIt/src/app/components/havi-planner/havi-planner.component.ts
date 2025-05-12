import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ColorPickerModule } from 'primeng/colorpicker';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { DayDetailsModalComponent } from '../day-details-modal/day-details-modal.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

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
  selector: 'app-havi-planner',
  standalone: true,
  imports: [CommonModule, FormsModule, ColorPickerModule, DayDetailsModalComponent, AlertModalComponent],
  templateUrl: './havi-planner.component.html',
  styleUrls: ['./havi-planner.component.scss']
})
export class HaviPlannerComponent {
  startDateType = 'text';
  endDateType = 'text';
  modalVisible = false;
  modalType: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalMessage = '';
  invalidFields: string[] = [];
  weekdays = ['H', 'K', 'Sz', 'Cs', 'P', 'Sz', 'V'];
  months = ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'];

  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();
  calendarDays: any[] = [];
  eventRows: CalendarEvent[][] = [];
  selectedEvents: CalendarEvent[] = [];

  events: CalendarEvent[] = [];
  eventss: CalendarEvent[] = [];
  editingEvent: CalendarEvent | null = null;
  newEvent = {
    title: '',
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

  selectMode = false;
  visibleWeekdayStartIndex = 0;
  currentSidebarView: 'add' | 'list' = 'add';
  userId = '';
  dayDetailsVisible = false;
  selectedDay: any = null;
  loading = true;

  touchStartX = 0; // Húzás kezdő pozíciója

  constructor(private apiService: ApiService, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.initializeUser();
  }

  // Bulk delete function
  deleteSelectedEvents() {
    const selectedEventIds = this.eventss.filter(event => event.selected).map(event => event.id);

    if (selectedEventIds.length > 0) {
      selectedEventIds.forEach(id => {
        if (id) {
          this.apiService.deleteEvent(id).subscribe({
            next: () => {
              // Deletion successful, update the local event list
              this.eventss = this.eventss.filter(event => event.id !== id);
              this.generateCalendar(); // Refresh the calendar
              this.selectMode = false; // Turn off selection mode
              this.modalMessage = 'Események sikeresen törölve.';
              this.modalType = 'success';
              this.modalVisible = true;
            },
            error: () => {
              this.modalMessage = 'Nem sikerült törölni a kijelölt eseményeket.';
              this.modalType = 'error';
              this.modalVisible = true;
            }
          });
        }
      });
    }
  }

  // Touch event handling for event deletion
  onTouchStart(event: TouchEvent, day: any) {
    this.touchStartX = event.touches[0].clientX;
  }

  onTouchEnd(event: TouchEvent, day: any) {
    const touchEndX = event.changedTouches[0].clientX;

    if (this.touchStartX - touchEndX > 50) { // Swipe left
      this.deleteEventFromDay(day); // Delete the event
    }
  }

  // Delete an individual event from the calendar and database
  deleteEventFromDay(day: any) {
    const eventToDelete = this.eventss.find(event => event.days?.includes(day.date));

    if (eventToDelete && eventToDelete.id) {  // Check if ID exists
      this.apiService.deleteEvent(eventToDelete.id).subscribe({
        next: () => {
          // Event deletion successful, refresh the event list and calendar
          this.eventss = this.eventss.filter(event => event.id !== eventToDelete.id);
          this.generateCalendar(); // Refresh the calendar
          this.modalMessage = 'Esemény törölve!';
          this.modalType = 'success';
          this.modalVisible = true;
        },
        error: () => {
          this.modalMessage = 'Nem sikerült törölni az eseményt.';
          this.modalType = 'error';
          this.modalVisible = true;
        }
      });
    } else {
      // If no event is found for the given date
      this.modalMessage = 'Nem található esemény az adott dátummal.';
      this.modalType = 'error';
      this.modalVisible = true;
    }
  }

  NavigateTo(route: string): void {
    this.router.navigate([route]);
  }

  private initializeUser() {
    const user = this.authService.loggedUser();
    this.userId = user?.id;

    if (!this.userId) {
      this.loading = false;
      console.error('Nincs felhasználói azonosító');
      return;
    }

    this.apiService.getEventByUserId(this.userId).subscribe(events => {
      this.loading = false;
      if (events.length > 0) {
        this.events = events;
       this.eventss = events.map((event: CalendarEvent) => ({
  id: event.id, // <--- EZ HIÁNYZOTT
  title: event.title,
  description: event.description,
  startTime: new Date(event.startTime),
  endTime: new Date(event.endTime),
  color: event.color ?? '#000000',
  selected: false
}));

      } else {
        console.log('Nincsenek események');
      }
      this.generateCalendar();
    });
  }

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

calculateEventRows() {
  const rows: CalendarEvent[][] = [];

  for (const event of this.events) {
    if (!event || !event.startTime || !event.endTime) {
      console.warn('Hiányos esemény kihagyva:', event);
      continue;
    }

    const start = new Date(event.startTime);
    const end = new Date(event.endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.warn('Érvénytelen dátumú esemény kihagyva:', event);
      continue;
    }

    const days = this.getEventDays(start, end);

    let placed = false;
    for (const row of rows) {
      const overlaps = row.some(e => {
        if (!e.startTime || !e.endTime) return true;

        const es = new Date(e.startTime);
        const ee = new Date(e.endTime);
        return start <= ee && end >= es;
      });

      if (!overlaps) {
        row.push({ ...event, days });
        placed = true;
        break;
      }
    }

    if (!placed) {
      rows.push([{ ...event, days }]);
    }
  }

  return rows;
}


  getEventDays(start: Date, end: Date) {
    const days = [];
    let current = new Date(start);

    while (current <= end) {
      if (current.getMonth() === this.currentMonth && current.getFullYear() === this.currentYear) {
        days.push(current.getDate());
      }
      current.setDate(current.getDate() + 1);
    }

    return days;
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

  editSelectedEvent() {
    if (this.selectedEvents.length === 1) {
      console.log('Szerkesztés:', this.selectedEvents[0]);
    }
  }

  addEvent() {
    this.invalidFields = [];
    this.validateNewEvent();

    if (this.invalidFields.length > 0) {
      this.modalMessage = `Kérlek töltsd ki a következő mezőket helyesen: ${this.invalidFields.join(', ')}`;
      this.modalType = 'error';
      this.modalVisible = true;
      return;
    }

    const start = new Date(this.newEvent.startTime);
    const end = new Date(this.newEvent.endTime);
    if (start > end) {
      this.modalMessage = 'A kezdési időpont nem lehet később, mint a befejezés!';
      this.modalType = 'error';
      this.modalVisible = true;
      return;
    }

    const startTime = start.toISOString();
    const endTime = end.toISOString();

    if (this.editingEvent?.id) {
      this.updateEvent(startTime, endTime);
    } else {
      this.createEvent(startTime, endTime);
    }
  }

  validateNewEvent() {
    const { title, startTime, endTime } = this.newEvent;
    if (!title) this.invalidFields.push('Név');
    if (!startTime) this.invalidFields.push('Kezdés dátuma');
    if (!endTime) this.invalidFields.push('Befejezés dátuma');
    if (startTime?.length <= 10) this.invalidFields.push('Kezdés időpont (óra:perc is szükséges)');
    if (endTime?.length <= 10) this.invalidFields.push('Befejezés időpont (óra:perc is szükséges)');
  }

  createEvent(startTime: string, endTime: string) {
    const userId = this.authService.loggedUser()?.id;
    if (!userId) return;

    this.apiService.createEvent({
      title: this.newEvent.title,
      description: this.newEvent.description,
      startTime,
      endTime,
      color: this.newEvent.color,
      userId
    }).subscribe({
      next: (response) => {
    if (response.message === 'Esemény létrehozva!') {
      const start = new Date(response.event.startTime);
      const end = new Date(response.event.endTime);

      // Érvényesség ellenőrzése
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.error('Érvénytelen dátum formátum a válaszban:', response.event);
        this.modalMessage = 'Hiba: Érvénytelen dátum formátum érkezett a szervertől.';
        this.modalType = 'error';
        this.modalVisible = true;
        return;
      }

      const days = this.getEventDays(start, end);

      const newEvent = {
        id: response.event.id ?? '',
        title: response.event.title,
        description: response.event.description,
        startTime: start,
        endTime: end,
        color: response.event.color ?? '#000000',
        days
      };

      this.events.push(newEvent);
      this.eventss.push({ ...newEvent, selected: false });

      this.modalMessage = 'Esemény sikeresen hozzáadva';
      this.modalType = 'success';
      this.modalVisible = true;

      this.generateCalendar();
      this.resetNewEventForm();
    } else {
      this.modalMessage = 'Hiba: A szerver nem küldött vissza esemény adatokat.';
      this.modalType = 'error';
      this.modalVisible = true;
    }
  }
      ,
      error: () => {
        this.modalMessage = 'Szerverhiba: nem sikerült az eseményt elmenteni.';
        this.modalType = 'error';
        this.modalVisible = true;
      }
    });
  }

  updateEvent(startTime: string, endTime: string) {
    this.apiService.updateEvent(this.editingEvent!.id!, {
      title: this.newEvent.title,
      description: this.newEvent.description,
      startTime,
      endTime
    }).subscribe({
      next: (response) => {
        this.modalMessage = 'Esemény sikeresen frissítve.';
        this.modalType = 'success';
        this.modalVisible = true;
        this.updateEventInList(response);
        this.resetNewEventForm();
      },
      error: () => {
        this.modalMessage = 'Nem sikerült frissíteni az eseményt.';
        this.modalType = 'error';
        this.modalVisible = true;
      }
    });
  }





  deleteEvent(eventToDelete: any) {
    console.log('Törlésre kijelölt esemény:', eventToDelete); // ← Ez segít nyomozni
    if (!eventToDelete?.id) return;

    this.apiService.deleteEvent(eventToDelete.id).subscribe({
      next: () => {
        // Ha sikeres a törlés az adatbázisban, akkor frissítjük a helyi listákat
        this.eventss = this.eventss.filter(event => event.id !== eventToDelete.id);
        this.events = this.events.filter(event => event.id !== eventToDelete.id);

        this.generateCalendar();

        this.modalMessage = 'Esemény sikeresen törölve.';
        this.modalType = 'success';
        this.modalVisible = true;
      },
      error: () => {
        this.modalMessage = 'Nem sikerült törölni az eseményt az adatbázisból.';
        this.modalType = 'error';
        this.modalVisible = true;
      }
    });
  }

  updateEventInList(updatedEvent: CalendarEvent) {
    const index = this.events.findIndex(e => e.id === updatedEvent.id);
    if (index !== -1) {
      this.events[index] = updatedEvent;
    }

    const listIndex = this.eventss.findIndex(e => e.id === updatedEvent.id);
    if (listIndex !== -1) {
      this.eventss[listIndex] = { ...updatedEvent, selected: false };
    }

    this.generateCalendar();
  }

  resetNewEventForm() {
    this.newEvent = { title: '', description: '', startTime: '', endTime: '', color: '#ff0000' };
    this.editingEvent = null;
  }

  toggleSelectMode() {
    this.selectMode = !this.selectMode;
  }


  showDayDetails(day: any): void {
    this.selectedDay = day;
    this.dayDetailsVisible = true;
  }
}
