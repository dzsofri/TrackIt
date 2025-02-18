import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Task {
  title: string;
  description: string;
}

interface Column {
  name: string;
  tasks: Task[];
}

@Component({
  selector: 'app-kanban',
  imports: [CommonModule],
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.scss']
})
export class KanbanComponent {
  columns: Column[] = [
    { name: 'Teendők', tasks: [{ title: 'Feladat 1', description: 'Leírás' }] },
    { name: 'Folyamatban', tasks: [] },
    { name: 'Kész', tasks: [] }
  ];

 // Stepes rész tartalma
  

  draggedTask: Task | null = null;
  draggedFrom: Column | null = null;

  onDragStart(event: DragEvent, task: Task, column: Column) {
    this.draggedTask = task;
    this.draggedFrom = column;
    event.dataTransfer?.setData('text', JSON.stringify(task));
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent, targetColumn: Column) {
    event.preventDefault();
    if (this.draggedTask && this.draggedFrom) { 
      this.draggedFrom.tasks = this.draggedFrom.tasks.filter((t: Task) => t !== this.draggedTask);
      targetColumn.tasks.push(this.draggedTask);
      this.draggedTask = null;
      this.draggedFrom = null;
    }
  }
}