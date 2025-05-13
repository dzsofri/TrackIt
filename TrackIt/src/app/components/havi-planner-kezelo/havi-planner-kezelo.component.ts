import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CalendarEvent } from '../../interfaces/CalendarEvent';
import { ApiService } from '../../services/api.service';
import { ColorPicker, ColorPickerModule } from 'primeng/colorpicker';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';

@Component({
  selector: 'app-havi-planner-kezelo',
  standalone: true,
  imports: [FormsModule, CommonModule, ColorPickerModule, AlertModalComponent],
  templateUrl: './havi-planner-kezelo.component.html',
  styleUrls: ['./havi-planner-kezelo.component.scss'],
  providers: [DatePipe]
})
export class HaviPlannerKezeloComponent implements OnInit {
  modalVisible = false;
  modalType: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalMessage = '';
  invalidFields: string[] = [];
  searchQuery = '';
  calendarDate: string = '';
  eventss: CalendarEvent[] = [];
  userId = '';
  filteredEvents: CalendarEvent[] = [];
  isSidebarCollapsed = false;

  constructor(
    private datePipe: DatePipe,
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.initializeUser();
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  onSearchChange(): void {
    this.filteredEvents = this.eventss.filter(event =>
      event.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

onEdit(event: CalendarEvent): void {
  event.editing = true;
  event._backup = {
    title: event.title,
    description: event.description,
    startTime: new Date(event.startTime),
    endTime: new Date(event.endTime)
  };

  // Konvertálás ISO formátumra a datetime-local inputhoz
  event.startTime = this.formatDateForInput(new Date(event.startTime));
  event.endTime = this.formatDateForInput(new Date(event.endTime));
}

  formatDateForInput(date: Date): string {
    return date.toISOString().slice(0, 16); // 'yyyy-MM-ddThh:mm'
  }

private initializeUser(): void {
  const user = this.authService.loggedUser();
  this.userId = user?.id;

  if (!this.userId) {
    this.showError('Nincs felhasználói azonosító');
    return;
  }

  this.apiService.getEventByUserId(this.userId).subscribe(
    events => {
      this.eventss = events.map((event: CalendarEvent) => ({
        ...event,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
        color: event.color ?? '#000000',
        selected: false,
        editing: false
      }));
      this.filteredEvents = [...this.eventss];
    },
    error => this.showError('Események betöltése sikertelen: ' + error.message)
  );
}

saveEvent(event: CalendarEvent): void {
  this.invalidFields = []; // Reset invalid fields array

  // Validate required fields
  if (!event.title || event.title.trim() === '') {
    this.invalidFields.push('title');
  }
  if (!event.description || event.description.trim() === '') {
    this.invalidFields.push('description');
  }
  if (!event.startTime) {
    this.invalidFields.push('startTime');
  }
  if (!event.endTime) {
    this.invalidFields.push('endTime');
  }

  // Validate that startTime is not later than endTime
  if (new Date(event.startTime) > new Date(event.endTime)) {
    this.invalidFields.push('startTime-endTime');
    this.modalMessage = 'A kezdődátum nem lehet később, mint a záródátum.';
    this.modalType = 'error';
    this.modalVisible = true;
    return;
  }

  // If there are invalid fields, show error and return early
  if (this.invalidFields.length > 0) {
    this.modalMessage = 'Néhány kötelező mező hiányzik vagy érvénytelen.';
    this.modalType = 'error';
    this.modalVisible = true;
    return;
  }

  // If the event has no issues, proceed with updating
  event.startTime = new Date(event.startTime);
  event.endTime = new Date(event.endTime).toISOString();
  delete event._backup;
  event.editing = false;

  // Update the event via API
  if (event.id) {
    this.apiService.updateEvent(event.id, {
      title: event.title,
      description: event.description, // Include description field
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toString(),
      color: event.color // Include color field
    }).subscribe(
      updatedEvent => {
        // Successfully updated the event
        const index = this.eventss.findIndex(e => e.id === updatedEvent.id);
        if (index !== -1) {
          this.eventss[index] = updatedEvent;
          this.filteredEvents = [...this.eventss];
        }
        // Success message
        this.modalMessage = 'Esemény sikeresen frissítve!';
        this.modalType = 'success';
        this.modalVisible = true;
      },
      error => {
        // Error occurred during event update
        this.modalMessage = 'Hiba történt az esemény frissítésénél: ' + error.message;
        this.modalType = 'error';
        this.modalVisible = true;
      }
    );
  }
}



deleteEvent(event: CalendarEvent): void {
  this.apiService.deleteEvent(event.id).subscribe(
    () => {
      // Az esemény törlése sikeresen megtörtént
      this.eventss = this.eventss.filter(e => e !== event);
      this.filteredEvents = this.filteredEvents.filter(e => e !== event);

      // Success message
      this.modalMessage = 'Esemény törölve!';
      this.modalType = 'success';
      this.modalVisible = true;
    },
    error => {
      // Ha hiba történik
      this.modalMessage = 'Hiba történt az esemény törlésénél: ' + error.message;
      this.modalType = 'error';
      this.modalVisible = true;
    }
  );
}


  onBack(): void {
    this.router.navigate(['/haviplanner']);
  }

  cancelEdit(event: CalendarEvent): void {
    if (event._backup) {
      event.title = event._backup.title;
      event.description = event._backup.description;
      event.startTime = event._backup.startTime;
      event.endTime = event._backup.endTime.toISOString();
      delete event._backup;
    }
    event.editing = false;
  }

onAddNewEvent(): void {
  const newEvent: CalendarEvent = {
    id: crypto.randomUUID(), // Véletlenszerű UUID generálás
    title: 'Új esemény',
    description: 'Leírás nem adott', // Default description
    startTime: new Date(),
    endTime: new Date().toISOString(),
    color: '#000000', // Az alapértelmezett szín
    selected: false,
    editing: true // Az esemény azonnal szerkeszthető állapotba kerül
  };

  // Szín és leírás küldése az API-nak
  this.apiService.createEvent({
    title: newEvent.title,
    description: newEvent.description, // Include description
    startTime: (newEvent.startTime instanceof Date ? newEvent.startTime : new Date(newEvent.startTime)).toISOString(),
    endTime: newEvent.endTime,
    color: newEvent.color ?? '#000000', // Szín hozzáadása
    userId: this.userId // A userId hozzáadása az új eseményhez
  }).subscribe(
    createdEvent => {
      // Az új esemény sikeresen létrejött
      this.eventss.push(createdEvent);
      this.filteredEvents = [...this.eventss];

      // Azonnali szerkesztés lehetősége
      createdEvent.editing = true; // Szerkeszthető állapotba állítjuk
    },
    error => this.showError('Új esemény létrehozása sikertelen: ' + error.message)
  );
}



  onCalendarChange(): void {
    if (!this.calendarDate) {
      this.filteredEvents = [...this.eventss];
      return;
    }

    const selectedDate = new Date(this.calendarDate);
    this.filteredEvents = this.eventss.filter(event =>
      new Date(event.startTime).toDateString() === selectedDate.toDateString()
    );
  }

  filterFutureEvents(): void {
    const now = new Date();
    this.filteredEvents = this.eventss.filter(event =>
      new Date(event.startTime) > now
    );
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.calendarDate = '';
    this.filteredEvents = [...this.eventss];
  }

  scrollToEvent(event: CalendarEvent): void {
    const id = this.generateEventId(event);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  generateEventId(event: CalendarEvent): string {
    return 'event-' + btoa(event.title + event.startTime).replace(/=/g, '');
  }

  // Error alert modal kezelése
  showError(message: string): void {
    this.modalType = 'error';
    this.modalMessage = message;
    this.modalVisible = true;
  }
}
