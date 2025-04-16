import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ColorPickerModule } from 'primeng/colorpicker';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { DayDetailsModalComponent } from '../day-details-modal/day-details-modal.component';

@Component({
  selector: 'app-havi-planner',
  standalone: true,
  imports: [CommonModule, FormsModule,ColorPickerModule, DayDetailsModalComponent, AlertModalComponent],
  templateUrl: './havi-planner.component.html',
  styleUrls: ['./havi-planner.component.scss']
})
export class HaviPlannerComponent {
  startDateType: string = 'text';
  endDateType: string = 'text';

  eventRows: any[][] = [];

  selectedDay: any = null;
  dayDetailsVisible: boolean = false;

  showDayDetails(day: any): void {
    this.selectedDay = day;
    this.dayDetailsVisible = true;
  }



  modalVisible = false;
  modalType: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalMessage = '';
  invalidFields: string[] = [];

  weekdays = ['H', 'K', 'Sz', 'Cs', 'P', 'Sz', 'V'];
  months = [
    'Január', 'Február', 'Március', 'Április', 'Május', 'Június',
    'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'
  ];

  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();

  newEvent = {
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    color: '#ff0000'  // alapértelmezett szín (piros)
  };


  calendarDays: any[] = [];
  events: any[] = []; // Események tárolása

  legends = [
    { color: 'deepskyblue', label: '30 napos víz kihívás' },
    { color: 'mediumseagreen', label: 'Történelem beadandó' },
    { color: 'red', label: 'Vizsganap' },
  ];

  constructor(private apiService: ApiService) {}


  ngOnInit() {
    this.apiService.getEvents().subscribe(events => {
      if (events.length > 0) {
        console.log('Események sikeresen lekérve:', events);  // Kiírjuk az eseményeket, ha sikerült
        this.events = events;  // Események tárolása
        this.generateCalendar();  // Naptár generálása
      } else {
        console.log('Nincsenek események');  // Ha nincs esemény, akkor ezt írja ki
      }
    });
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
        dots: [], // Nincs esemény
      });
    }

    // Aktuális hónap napjai
    for (let i = 1; i <= daysInMonth; i++) {
      const eventsForDay = this.getEventDots(i); // Események keresése a napon

      this.calendarDays.push({
        date: i,
        dots: eventsForDay, // Események hozzáadása
      });
    }

    // Kitöltés a hónap végéig (42 elem legyen)
    while (this.calendarDays.length < 42) {
      this.calendarDays.push({
        date: this.calendarDays.length - daysInMonth - startDay + 1,
        inactive: true,
        dots: [], // Nincs esemény
      });
    }
    this.eventRows = this.calculateEventRows();

  }
  getEventGridColumn(event: any): string {
    const startDay = new Date(event.startTime).getDate();
    const endDay = new Date(event.endTime).getDate();
    const offset = this.getDayOffset(startDay);
    const span = endDay - startDay + 1;

    return `${offset + 1} / span ${span}`;
  }

  getDayOffset(day: number): number {
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const startDay = (firstDayOfMonth.getDay() + 6) % 7; // hétfő az első
    return startDay + day - 1;
  }
  calculateEventRows() {
    const rows: any[][] = [];

    for (const event of this.events) {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);

      // Esemény tartománya napok szerint
      const eventDays = [];
      let current = new Date(start);

      while (current <= end) {
        if (current.getMonth() === this.currentMonth && current.getFullYear() === this.currentYear) {
          eventDays.push(current.getDate());
        }
        current.setDate(current.getDate() + 1);
      }

      // Próbáljuk hozzáadni egy meglévő sorhoz, ha nincs átfedés
      let placed = false;
      for (const row of rows) {
        const overlaps = row.some((e: any) => {
          const es = new Date(e.startTime);
          const ee = new Date(e.endTime);
          return (start <= ee && end >= es); // van átfedés
        });

        if (!overlaps) {
          row.push({ ...event, days: eventDays });
          placed = true;
          break;
        }
      }

      // Ha nem tudtuk elhelyezni egy sorban, új sort nyitunk
      if (!placed) {
        rows.push([{ ...event, days: eventDays }]);
      }
    }

    return rows;
  }


  getEventDots(day: number) {
    const currentDate = new Date(this.currentYear, this.currentMonth, day);
    currentDate.setHours(0, 0, 0, 0);

    return this.events
    .filter(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);

      return eventStart <= currentDate && currentDate <= eventEnd;
    })
    .map(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);

      const isStart = eventStart.toDateString() === currentDate.toDateString();
      const isEnd = eventEnd.toDateString() === currentDate.toDateString();

      return {
        title: event.title,
        color: event.color || 'deepskyblue', // fallback szín, ha nincs
        isStart: isStart,
        eventStart: eventStart,
        eventEnd:eventEnd,
        isEnd
      };


    });

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
    this.invalidFields = [];

    if (!this.newEvent.name) this.invalidFields.push('Név');
    if (!this.newEvent.startTime) this.invalidFields.push('Kezdés dátuma');
    if (!this.newEvent.endTime) this.invalidFields.push('Befejezés dátuma');

    // Ellenőrzés, hogy a dátum tartalmaz-e időpontot (óra:perc) is
    if (this.newEvent.startTime && this.newEvent.startTime.length <= 10) {
      this.invalidFields.push('Kezdés időpont (óra:perc is szükséges)');
    }
    if (this.newEvent.endTime && this.newEvent.endTime.length <= 10) {
      this.invalidFields.push('Befejezés időpont (óra:perc is szükséges)');
    }

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
      this.modalMessage = 'A kezdési időpont nem lehet később, mint a befejezési időpont!';
      this.modalType = 'error';
      this.modalVisible = true;
      return;
    }

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

          this.events.push({
            title: this.newEvent.name,
            startTime: startTime,
            endTime: endTime,
            color: this.newEvent.color
          });

          this.generateCalendar();

          this.newEvent = {
            name: '',
            description: '',
            startTime: '',
            endTime: '',
            color: '#ff0000'
          };
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



  visibleWeekdayStartIndex = 0;

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
}
