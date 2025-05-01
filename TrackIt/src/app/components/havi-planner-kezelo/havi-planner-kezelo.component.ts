import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-havi-planner-kezelo',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './havi-planner-kezelo.component.html',
  styleUrls: ['./havi-planner-kezelo.component.scss'],
  providers: [DatePipe]
})
export class HaviPlannerKezeloComponent {
  searchTerm = '';
  calendarDate: string = '';

  eventss = [
    {
      name: 'Konferencia 2025',
      startTime: new Date('2025-05-10T10:00:00'),
      endTime: new Date('2025-05-10T12:00:00'),
      selected: false,
      editing: false
    },
    {
      name: 'Workshop: Angular alapok',
      startTime: new Date('2025-05-12T14:00:00'),
      endTime: new Date('2025-05-12T17:00:00'),
      selected: false,
      editing: false
    },
    {
      name: 'Networking est',
      startTime: new Date('2025-05-15T18:30:00'),
      endTime: new Date('2025-05-15T21:00:00'),
      selected: false,
      editing: false
    }
  ];

  filteredEvents = this.eventss;

  constructor(private datePipe: DatePipe) {}

  // 🔍 Keresés szöveg alapján
  onSearchChange() {
    this.filteredEvents = this.eventss.filter(event => 
      event.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // ✏️ Szerkesztés elindítása
  onEdit(event: any) {
    event.editing = true;
    event._backup = {
      name: event.name,
      startTime: event.startTime,
      endTime: event.endTime
    };
  }

  // 💾 Mentés
  saveEvent(event: any) {
    delete event._backup;
    event.editing = false;
  }

  // ❌ Mégse
  cancelEdit(event: any) {
    if (event._backup) {
      event.name = event._backup.name;
      event.startTime = event._backup.startTime;
      event.endTime = event._backup.endTime;
      delete event._backup;
    }
    event.editing = false;
  }

  // ➕ Új esemény hozzáadása
  onAddNewEvent() {
    const newEvent = {
      name: 'Új esemény',
      startTime: new Date(),
      endTime: new Date(),
      selected: false,
      editing: true
    };

    this.eventss.push(newEvent);
    this.filteredEvents = this.eventss;
  }

  // 📅 Dátum szűrés mini naptárral
  onCalendarChange() {
    if (!this.calendarDate) {
      this.filteredEvents = this.eventss;
      return;
    }

    const selectedDate = new Date(this.calendarDate);
    this.filteredEvents = this.eventss.filter(event =>
      new Date(event.startTime).toDateString() === selectedDate.toDateString()
    );
  }

  // ⏩ Jövőbeli események szűrése
  filterFutureEvents() {
    const now = new Date();
    this.filteredEvents = this.eventss.filter(event =>
      new Date(event.startTime) > now
    );
  }

  // 🔄 Szűrők alaphelyzetbe
  resetFilters() {
    this.searchTerm = '';
    this.calendarDate = '';
    this.filteredEvents = this.eventss;
  }
}
