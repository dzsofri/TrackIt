import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Task {
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
export class KanbanComponent {
  columns: Column[] = [
    { name: 'Teendők', tasks: [{ title: 'Feladat 1', description: 'Leírás', deadline: '2025-02-21T12:00', priority: 'Közepes' }] },
    { name: 'Folyamatban', tasks: [] },
    { name: 'Kész', tasks: [] }
  ];

  draggedTask: Task | null = null;
  draggedFrom: Column | null = null;

  // Új feladat adatai
  newTask: Task = { title: '', description: '', deadline: '', priority: 'Közepes' };

  // Új feladat hozzáadása a "Teendők" oszlophoz
  addTask() {
    if (this.newTask.title.trim()) {
      this.columns[0].tasks.push({ ...this.newTask });
      this.newTask = { title: '', description: '', deadline: '', priority: 'Közepes' }; // Mezők ürítése
    }
  }

  onDragStart(event: DragEvent, task: Task, column: Column) {
    this.draggedTask = task;
    this.draggedFrom = column;
    event.dataTransfer?.setData('task', JSON.stringify(task));
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = "move";
  }

  onDrop(event: DragEvent, targetColumn: Column) {
    event.preventDefault();
    if (this.draggedTask && this.draggedFrom && this.draggedFrom !== targetColumn) {
      this.draggedFrom.tasks = this.draggedFrom.tasks.filter(t => t !== this.draggedTask);
      targetColumn.tasks.push(this.draggedTask);
      this.draggedTask = null;
      this.draggedFrom = null;
    }
  }

  onDragEnter(event: DragEvent) {
    event.preventDefault();
  }

  onDragLeave(event: DragEvent) {}

  // Prioritás beállítása
  setPriority(priority: 'Alacsony' | 'Közepes' | 'Magas') {
    this.newTask.priority = priority;
  }
}
