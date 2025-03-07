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
  status: 'todo' | 'in-progress' | 'done'; // Ezt add hozzá!
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
    this.http.get<{ tasks: Task[] }>("http://localhost:3000/tasks")
      .subscribe({
        next: (response) => {
          console.log("Feladatok betöltve:", response.tasks);
  
          // Az oszlopok tisztítása
          this.columns.forEach(column => column.tasks = []);
  
          // A megfelelő oszlopokba helyezzük a feladatokat
          response.tasks.forEach(task => {
            if (task.status === 'todo') {
              this.columns[0].tasks.push(task); // Teendők oszlop
            } else if (task.status === 'in-progress') {
              this.columns[1].tasks.push(task); // Folyamatban oszlop
            } else if (task.status === 'done') {
              this.columns[2].tasks.push(task); // Kész oszlop
            }
          });
        },
        error: (error) => {
          console.error("Hiba történt a feladatok lekérdezésekor:", error);
        }
      });
  }
  

  // **Új feladat inicializálása**
  private createEmptyTask(): Task {
    return { title: '', description: '', dueDate: '', priority: 'Közepes', status: 'todo' };
  }
  

  // **Új feladat hozzáadása**
  addTask() {
    if (!this.newTask.title.trim() || !this.newTask.dueDate) {
      console.warn('A cím és a határidő megadása kötelező!');
      return;
    }
  
    const taskToSend: Task = {
      title: this.newTask.title.trim(),
      description: this.newTask.description.trim() || "",
      dueDate: this.newTask.dueDate,
      priority: this.newTask.priority || "Közepes",
      status: "todo" // Kezdetben a "todo" oszlopban lesz
    };
  
    this.http.post<{ message: string, task: Task }>("http://localhost:3000/tasks", taskToSend)
      .subscribe({
        next: (response) => {
          console.log("Feladat sikeresen mentve:", response);
  
          // **Helyesen hozzáadjuk a task-ot a Kanban táblához**
          this.columns[0].tasks.push({
            id: response.task.id,
            title: response.task.title,
            description: response.task.description || "Nincs leírás",
            dueDate: response.task.dueDate || "Nincs határidő",
            priority: response.task.priority || "Közepes",
            status: 'todo'
          });
  
          // **Számláló frissítése**
          this.updateTaskCount();
  
          // **Űrlap ürítése új feladat után**
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
      // Feladat áthelyezése az új oszlopba
      this.draggedFrom.tasks = this.draggedFrom.tasks.filter(t => t !== this.draggedTask);
      targetColumn.tasks.push(this.draggedTask);
  
      // **Számláló frissítése minden oszlopnál**
      this.updateTaskCount();
  
      this.draggedTask = null;
      this.draggedFrom = null;
    }
  }

  onDragStart(event: DragEvent, task: Task, column: Column) {
    this.draggedTask = task;
    this.draggedFrom = column;
    event.dataTransfer?.setData('task', JSON.stringify(task));
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
      this.newTask.dueDate = input.value; // Hagyjuk az eredeti YYYY-MM-DD formátumot
    } else {
      this.newTask.dueDate = '';
    }
  }
  
  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'Alacsony': return 'low';
      case 'Közepes': return 'medium';
      case 'Magas': return 'high';
      default: return '';
    }
  }
  
  updateTaskCount() {
    this.columns.forEach(column => {
      // Ha szükséges, az oszlopok tömbjének frissítéséhez hozzáadhatunk további logikát
      console.log(`${column.name}: ${column.tasks.length} feladat`);
    });

  }
}
