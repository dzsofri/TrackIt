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
  standalone: true,
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

  draggedTask: Task | null = null;
  draggedFrom: Column | null = null;

  onDragStart(event: DragEvent, task: Task, column: Column) {
    this.draggedTask = task;
    this.draggedFrom = column;
    // Alapértelmezett viselkedés megakadályozása
    event.dataTransfer?.setData('task', JSON.stringify(task));
  }

  onDragOver(event: DragEvent, column: Column) {
    event.preventDefault();  // Alapértelmezett viselkedés letiltása (engedjük a húzást)
    event.dataTransfer!.dropEffect = "move";  // Vizualizálja, hogy az elem mozgatása lehetséges
  }

  onDrop(event: DragEvent, targetColumn: Column) {
    event.preventDefault();
  
    // Ha van húzott feladat és nem ugyanarról az oszlopról van szó
    if (this.draggedTask && this.draggedFrom && this.draggedFrom !== targetColumn) {
      // Eltávolítjuk a feladatot az eredeti oszlopból
      if (this.draggedFrom) {
        this.draggedFrom.tasks = this.draggedFrom.tasks.filter(t => t !== this.draggedTask);
      }
  
      // Hozzáadjuk a feladatot a cél oszlophoz
      targetColumn.tasks.push(this.draggedTask);
  
      // Nullázza a húzott feladatot és oszlopot
      this.draggedTask = null;
      this.draggedFrom = null;
    }
  }

  // Ha a drag a cél oszlop fölött van, akkor szükséges
  onDragEnter(event: DragEvent, column: Column) {
    event.preventDefault();
    // Itt változtathatsz például az oszlop háttérszínén, hogy jelezze, hogy engedi az elemet:
    const columnElement = event.target as HTMLElement;
    columnElement.style.backgroundColor = "#f0f8ff";  // Példa vizuális változtatás
  }

  // Ha elhagyjuk a cél oszlopot, akkor visszaállítjuk az állapotot
  onDragLeave(event: DragEvent, column: Column) {
    const columnElement = event.target as HTMLElement;
    columnElement.style.backgroundColor = "";  // Visszaállítjuk az eredeti színt
  }
}