import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ColorPickerModule } from 'primeng/colorpicker';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { DayDetailsModalComponent } from '../day-details-modal/day-details-modal.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CalendarEvent } from '../../interfaces/CalendarEvent';



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
  touchStartX = 0;

  constructor(private apiService: ApiService, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.initializeUser();
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
      this.events = events;
      this.eventss = events
        .filter((event: CalendarEvent) => event && event.startTime && event.endTime)
        .map((event: CalendarEvent) => ({
          ...event,
          startTime: new Date(event.startTime),
          endTime: new Date(event.endTime),
          color: event.color ?? '#000000',
          selected: false
        }));
      this.generateCalendar();
    });


  }

  generateCalendar() {
    this.calendarDays = this.createCalendarDays();
    this.eventRows = this.calculateEventRows();
  }

  createCalendarDays() {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const startDay = (firstDay.getDay() + 6) % 7;
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
        const start = new Date(event.startTime);
        const end = new Date(event.endTime);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        return start <= currentDate && currentDate <= end;
      })
      .map(event => ({
        title: event.title,
        color: event.color ?? 'deepskyblue',
        isStart: new Date(event.startTime).toDateString() === currentDate.toDateString(),
        isEnd: new Date(event.endTime).toDateString() === currentDate.toDateString()
      }));return this.events
      .filter(event => {
        if (!event?.startTime || !event?.endTime) return false;
        const start = new Date(event.startTime);
        const end = new Date(event.endTime);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        return start <= currentDate && currentDate <= end;
      })
      .map(event => ({
        title: event.title,
        color: event.color ?? 'deepskyblue',
        isStart: new Date(event.startTime).toDateString() === currentDate.toDateString(),
        isEnd: new Date(event.endTime).toDateString() === currentDate.toDateString()
      }));

  }

  calculateEventRows() {
    const rows: CalendarEvent[][] = [];

    for (const event of this.events) {
      if (!event || !event.startTime || !event.endTime) continue;

      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;

      const days = this.getEventDays(start, end);

      let placed = false;
      for (const row of rows) {
        const overlaps = row.some(e => {
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

  toggleSelectMode() {
    this.selectMode = !this.selectMode;
  }

  deleteSelectedEvents() {
    const selectedEventIds = this.eventss.filter(e => e.selected).map(e => e.id);
    if (selectedEventIds.length === 0) return;

    selectedEventIds.forEach(id => {
      if (!id) return;
      this.apiService.deleteEvent(id).subscribe({
        next: () => {
          this.eventss = this.eventss.filter(e => e.id !== id);
          this.generateCalendar();
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
    });
    this.selectMode = false;
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
    const event = this.eventss.find(e => e.days?.includes(day.date));
    if (!event?.id) {
      this.modalMessage = 'Nem található esemény az adott dátummal.';
      this.modalType = 'error';
      this.modalVisible = true;
      return;
    }

    this.apiService.deleteEvent(event.id).subscribe({
      next: () => {
        this.eventss = this.eventss.filter(e => e.id !== event.id);
        this.generateCalendar();
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
  }

  addEvent() {
    this.invalidFields = [];
    this.validateNewEvent();
    if (this.invalidFields.length > 0) {
      this.modalMessage = `Kérlek töltsd ki: ${this.invalidFields.join(', ')}`;
      this.modalType = 'error';
      this.modalVisible = true;
      return;
    }

    const start = this.formatTimeToString(this.newEvent.startTime); // String formátum
    const end = this.formatTimeToString(this.newEvent.endTime); // String formátum
    if (new Date(start) > new Date(end)) {
      this.modalMessage = 'A kezdési időpont nem lehet későbbi, mint a befejezés!';
      this.modalType = 'error';
      this.modalVisible = true;
      return;
    }

    if (this.editingEvent?.id) {
      this.updateEvent(start, end);
    } else {
      this.createEvent(start, end);
    }
  }

  formatTimeToString(time: string): string {
    const date = new Date(time);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Hónap 2 karakteres formátum
    const day = String(date.getDate()).padStart(2, '0');  // Nap 2 karakteres formátum
    const hours = String(date.getHours()).padStart(2, '0');  // Órák 2 karakteres formátum
    const minutes = String(date.getMinutes()).padStart(2, '0');  // Percek 2 karakteres formátum
    return `${year}-${month}-${day} ${hours}:${minutes}:00`;  // `yyyy-mm-dd HH:mm:ss`
  }

  updateEvent(startTime: string, endTime: string) {
    this.apiService.updateEvent(this.editingEvent!.id!, {
      title: this.newEvent.title,
      description: this.newEvent.description,
      startTime,
      endTime
    }).subscribe({
      next: (response) => {
        this.modalMessage = 'Esemény frissítve.';
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

  createEvent(startTime: string, endTime: string) {
    const userId = this.authService.loggedUser()?.id;
    if (!userId) return;

    // Az adatok előkészítése
    const eventData = {
      title: this.newEvent.title,
      description: this.newEvent.description,
      startTime: startTime,  // Formázott string
      endTime: endTime,  // Formázott string
      color: this.newEvent.color,
      userId: userId
    };
    this.apiService.createEvent(eventData).subscribe({
      next: (response) => {
        console.log('Kapott válasz:', response);

        // Ha a válaszban a message mező található, akkor azt kezeljük
        if (response?.message === 'Esemény létrehozva!') {
          // Esemény sikeresen létrehozva, itt állíthatod be a modal üzenetet
          this.modalMessage = 'Esemény sikeresen hozzáadva';
          this.modalType = 'success';
          this.modalVisible = true;
          this.resetNewEventForm();

          // Ha szükséges, itt hozzáadhatod az eseményt a naptárhoz is.
          // Például, ha az esemény létrehozása után az adatokat frissíteni akarod, akkor itt tudod frissíteni.
        } else {
          // Ha nem sikerült, akkor hibaüzenetet jelenítesz meg
          this.modalMessage = 'Szerverhiba: nem sikerült az eseményt elmenteni.';
          this.modalType = 'error';
          this.modalVisible = true;
        }
      },
      error: () => {
        this.modalMessage = 'Szerverhiba: nem sikerült az eseményt elmenteni.';
        this.modalType = 'error';
        this.modalVisible = true;
      }
    });

  }


  validateNewEvent() {
    const { title, startTime, endTime } = this.newEvent;
    if (!title) this.invalidFields.push('Név');
    if (!startTime) this.invalidFields.push('Kezdés dátuma');
    if (!endTime) this.invalidFields.push('Befejezés dátuma');
    if (startTime?.length <= 10) this.invalidFields.push('Kezdés idő (óra:perc)');
    if (endTime?.length <= 10) this.invalidFields.push('Befejezés idő (óra:perc)');
  }


  updateEventInList(updatedEvent: CalendarEvent) {
    const index = this.events.findIndex(e => e.id === updatedEvent.id);
    if (index !== -1) this.events[index] = updatedEvent;

    const listIndex = this.eventss.findIndex(e => e.id === updatedEvent.id);
    if (listIndex !== -1) this.eventss[listIndex] = { ...updatedEvent, selected: false };

    this.generateCalendar();
  }

  resetNewEventForm() {
    this.newEvent = { title: '', description: '', startTime: '', endTime: '', color: '#ff0000' };
    this.editingEvent = null;
  }

  deleteEvent(eventToDelete: CalendarEvent) {
    if (!eventToDelete?.id) return;

    this.apiService.deleteEvent(eventToDelete.id).subscribe({
      next: () => {
        this.eventss = this.eventss.filter(e => e.id !== eventToDelete.id);
        this.events = this.events.filter(e => e.id !== eventToDelete.id);
        this.generateCalendar();
        this.modalMessage = 'Esemény sikeresen törölve.';
        this.modalType = 'success';
        this.modalVisible = true;
      },
      error: () => {
        this.modalMessage = 'Nem sikerült törölni az eseményt.';
        this.modalType = 'error';
        this.modalVisible = true;
      }
    });
  }

  showDayDetails(day: any) {
    this.selectedDay = day;
    this.dayDetailsVisible = true;
  }

  NavigateTo(route: string) {
    this.router.navigate([route]);
  }

  editSelectedEvent() {
    if (this.selectedEvents.length === 1) {
      console.log('Szerkesztés:', this.selectedEvents[0]);
    }
  }
}
