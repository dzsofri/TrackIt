import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Task {
  id?: string;
  title: string;
  description: string;
  deadline: string;
  priority: 'Alacsony' | 'Közepes' | 'Magas';
}

interface Column {
  name: string;
  tasks: Task[];
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

  newTask: Task = { title: '', description: '', deadline: '', priority: 'Közepes' };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadTasks();
  }

  // **Feladatok betöltése az adatbázisból**
  loadTasks() {
    this.http.get<Task[]>('http://localhost:3000/tasks').subscribe(tasks => {
      this.columns[0].tasks = tasks;
    });
  }

  // **Új feladat hozzáadása**
  addTask() {
    if (this.newTask.title.trim()) {
      this.http.post('http://localhost:3000/tasks', this.newTask).subscribe(() => {
        this.loadTasks();
        this.newTask = { title: '', description: '', deadline: '', priority: 'Közepes' };
      });
    }
  }

  // **Feladat áthelyezése másik oszlopba**
  onDrop(event: DragEvent, targetColumn: Column) {
    event.preventDefault();
    if (this.draggedTask && this.draggedFrom && this.draggedFrom !== targetColumn) {
      this.draggedFrom.tasks = this.draggedFrom.tasks.filter(t => t !== this.draggedTask);
      targetColumn.tasks.push(this.draggedTask);

      // Backend frissítés
      this.http.put(`http://localhost:3000/tasks/${this.draggedTask.id}`, { 
        title: this.draggedTask.title, 
        description: this.draggedTask.description, 
        deadline: this.draggedTask.deadline, 
        priority: this.draggedTask.priority 
      }).subscribe();

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

  onDragLeave(event: DragEvent) {}

  // **Prioritás beállítása**
  setPriority(priority: 'Alacsony' | 'Közepes' | 'Magas') {
    this.newTask.priority = priority;
  }
}
