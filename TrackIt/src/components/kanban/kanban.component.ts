import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Task {
  id?: string; // Az azonosító opcionális
  title: string; // A feladat címe
  description: string; // A feladat leírása
  dueDate: string; // A határidő, pl. 'YYYY-MM-DD' formátumban
  priority: 'Alacsony' | 'Közepes' | 'Magas'; // A prioritás típusa
  userId?: string; // Az opcionális felhasználói azonosító
}

interface Column {
  name: string; // Az oszlop neve
  tasks: Task[]; // A benne lévő feladatok
}

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.scss']
})
export class KanbanComponent implements OnInit {
  columns: Column[] = [
    { name: 'Teendők', tasks: [] },
    { name: 'Folyamatban', tasks: [] },
    { name: 'Kész', tasks: [] }
  ];

  draggedTask: Task | null = null;
  draggedFrom: Column | null = null;
  newTask: Task = this.createEmptyTask();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Itt nem töltünk be feladatokat
  }

  // **Új feladat inicializálása**
  private createEmptyTask(): Task {
    return { title: '', description: '', dueDate: '', priority: 'Közepes' };
  }

  // **Új feladat hozzáadása**
  addTask() {
    console.log('newTask:', this.newTask); // Debugging céljából
  
    if (!this.newTask.title.trim() || !this.newTask.dueDate) {
      console.warn('A cím és a határidő megadása kötelező!');
      return;
    }
  
    const taskToSend: Task = {
      ...this.newTask
    };
  
    // **Token lekérése a localStorage-ból**
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Nincs bejelentkezett felhasználó!");
      return;
    }
  
    // **Autentikációs fejlécek beállítása**
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    };
  
    // **Feladat elküldése a szerverre**
    this.http.post<Task>("http://localhost:3000/tasks", taskToSend, { headers }).subscribe({
      next: (response) => {
        console.log("Feladat sikeresen mentve:", response);
        this.columns[0].tasks.push(response); // A szerver által generált ID-val adjuk hozzá
        this.newTask = this.createEmptyTask();
      },
      error: (error) => {
        console.error("Hiba történt a mentés során:", error);
      }
    });
  }
  



  // **Feladat áthelyezése másik oszlopba**
  onDrop(event: DragEvent, targetColumn: Column) {
    event.preventDefault();
    if (this.draggedTask && this.draggedFrom && this.draggedFrom !== targetColumn) {
      this.draggedFrom.tasks = this.draggedFrom.tasks.filter(t => t !== this.draggedTask);
      targetColumn.tasks.push(this.draggedTask);

      this.draggedTask = null;
      this.draggedFrom = null;
    }
  }

  onDragStart(event: DragEvent, task: Task, column: Column) {
    this.draggedTask = task;
    this.draggedFrom = column;
    event.dataTransfer?.setData('task', JSON.stringify(task));
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDragEnter(event: DragEvent) {
    event.preventDefault();
  }

  // **Prioritás beállítása**
  setPriority(priority: 'Alacsony' | 'Közepes' | 'Magas') {
    this.newTask.priority = priority;
  }

  onDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      const date = new Date(input.value);
      this.newTask.dueDate = date.toISOString().split("T")[0]; // Csak YYYY-MM-DD
    } else {
      this.newTask.dueDate = '';
    }
  }
}
