import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CalendarEvent } from '../../interfaces/CalendarEvent';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-havi-planner-kezelo',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './havi-planner-kezelo.component.html',
  styleUrls: ['./havi-planner-kezelo.component.scss'],
  providers: [DatePipe]
})
export class HaviPlannerKezeloComponent implements OnInit {
  searchQuery = '';
  calendarDate: string = '';
  eventss: CalendarEvent[] = [];
  userId = '';
  filteredEvents: CalendarEvent[] = [];

  constructor(
    private datePipe: DatePipe,
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.initializeUser();
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
  }

  private initializeUser(): void {
    const user = this.authService.loggedUser();
    this.userId = user?.id;

    if (!this.userId) {
      console.error('Nincs felhasználói azonosító');
      return;
    }

    this.apiService.getEventByUserId(this.userId).subscribe(events => {
      this.eventss = events.map((event: CalendarEvent) => ({
        ...event,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
        color: event.color ?? '#000000',
        selected: false,
        editing: false
      }));
      this.filteredEvents = [...this.eventss];
    });
  }

  saveEvent(event: CalendarEvent): void {
    delete event._backup;
    event.editing = false;

    // Itt lehet API frissítést is küldeni: this.apiService.updateEvent(event).subscribe()
  }

  deleteEvent(event: CalendarEvent): void {
    if (confirm(`Biztosan törölni szeretnéd a "${event.title}" eseményt?`)) {
      this.eventss = this.eventss.filter(e => e !== event);
      this.filteredEvents = this.filteredEvents.filter(e => e !== event);

      // Itt lehet API törlést is küldeni: this.apiService.deleteEvent(event.id).subscribe()
    }
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
      description: 'Leírás nem adott',
      startTime: new Date(),
      endTime: new Date().toISOString(),
      color: '#000000',
      selected: false,
      editing: true
    };

    this.eventss.push(newEvent);
    this.filteredEvents = [...this.eventss];
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
}
