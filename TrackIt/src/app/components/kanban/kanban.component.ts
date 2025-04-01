import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TaskEditComponent } from '../task-edit/task-edit.component';
import { environment } from '../../environments/environment';
import { ApiService } from '../../services/api.service';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'Alacsony' | 'Közepes' | 'Magas';
  userId?: string;
  status: 'todo' | 'in-progress' | 'done';
  showMenu?: boolean;
}

interface Column {
  name: string;
  status: 'todo' | 'in-progress' | 'done';
  tasks: Task[];
}

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskEditComponent, AlertModalComponent],
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.scss']
})

export class KanbanComponent implements OnInit {
  noTasksMessage: string | null = null; // Üzenet tárolására
  confirmingTask: Task | null = null;
  confirmingTargetColumn: Column | null = null;
  popupMessage: string | null = null;
  showPopup: boolean = false;
  popupTimeout: any;


  modalVisible = false;
  isModalVisible = false;
  modalType: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalMessage = '';
  invalidFields: string[] = [];


  private tokenName = environment.tokenName;

  columns: Column[] = [
    { name: 'Teendők', status: 'todo', tasks: [] },
    { name: 'Folyamatban', status: 'in-progress', tasks: [] },
    { name: 'Kész', status: 'done', tasks: [] }
  ];

  getToken(): String | null {
    return localStorage.getItem(this.tokenName);
  }

  tokenHeader(): { headers: HttpHeaders } {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return { headers }
  }

  draggedTask: Task | null = null;
  draggedFrom: Column | null = null;
  newTask: Task = this.createEmptyTask();

  constructor(private http: HttpClient, private api: ApiService) { }

  ngOnInit() {
    this.invalidFields = []; 
    
    this.http.get<{ message?: string; tasks: Task[] }>("http://localhost:3000/tasks")
      .subscribe({
        next: (response) => {
          console.log("Feladatok betöltve:", response.tasks);

          // Az oszlopok kiürítése az új betöltéshez
          this.columns.forEach(column => column.tasks = []);

          if (response.tasks.length === 0) {
            this.noTasksMessage = response.message || "Nincsenek feladatok az adatbázisban!";
            return;
          }

          // Csak a "todo" és "in-progress" státuszú feladatokat adjuk hozzá
          response.tasks.forEach(task => {
            if (task.status === 'todo') {
              this.columns[0].tasks.push(task);
            } else if (task.status === 'in-progress') {
              this.columns[1].tasks.push(task);
            }
          });

          console.log('Updated columns:', this.columns);
        },
        error: (error) => {
          console.error("Hiba történt a feladatok lekérdezésekor:", error);
          this.noTasksMessage = "Hiba történt a feladatok betöltésekor.";
        }
      });
  }

  private createEmptyTask(): Task {
    return { id: '', title: '', description: '', dueDate: '', priority: 'Közepes', status: 'todo' };
  }

  addTask() {
    if (!this.newTask.title.trim() || !this.newTask.dueDate) {
      console.warn();

      // Modal beállítása sikeres bejelentkezéshez
      this.modalMessage = 'A cím és a határidő megadása kötelező!'
      this.modalType = 'error';
      this.isModalVisible = true;
      return;
    }

    const taskToSend: Task = {
      id: '',
      title: this.newTask.title.trim(),
      description: this.newTask.description.trim() || "",
      dueDate: this.newTask.dueDate,
      priority: this.newTask.priority || "Közepes",
      status: this.newTask.status || "todo" // Kezdetben a "todo" oszlopban lesz
    };

    this.http.post<{ message: string, task: Task }>("http://localhost:3000/tasks", taskToSend, this.tokenHeader())
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

  // Feladat áthelyezés
  onDrop(event: DragEvent, targetColumn: Column) {
    event.preventDefault();
    if (this.draggedTask && this.draggedFrom && this.draggedFrom !== targetColumn) {
      if (targetColumn.status === 'done') {
        this.confirmingTask = this.draggedTask;
        this.confirmingTargetColumn = targetColumn;
        this.popupMessage = `Biztosan a "Kész" oszlopba szeretnéd helyezni a feladatot: ${this.draggedTask.title}?`;
        this.showPopup = true;

        // Automatikus eltűnés 5 mp után
        clearTimeout(this.popupTimeout);
        this.popupTimeout = setTimeout(() => {
          this.showPopup = false;
          this.confirmingTask = null;
          this.confirmingTargetColumn = null;
        }, 5000);
        return;
      }

      this.moveTaskToColumn(this.draggedTask, targetColumn);
    }
  }

  confirmTaskMove() {
    if (this.confirmingTask && this.confirmingTargetColumn) {
      // Ha megerősítettük a mozgást
      this.moveTaskToColumn(this.confirmingTask, this.confirmingTargetColumn);
      this.showPopup = false;
      this.confirmingTask = null;
      this.confirmingTargetColumn = null;
    }
  }

  cancelTaskMove() {
    this.showPopup = false;
    this.confirmingTask = null;
    this.confirmingTargetColumn = null;
    clearTimeout(this.popupTimeout);
  }

  moveTaskToColumn(task: Task, targetColumn: Column) {
    const sourceColumn = this.columns.find(column => column.status === task.status);
    if (sourceColumn) {
      sourceColumn.tasks = sourceColumn.tasks.filter(t => t !== task);
    }
    task.status = targetColumn.status;
    targetColumn.tasks.push(task);
  
    // Frissítés az adatbázisban
    this.api.updateTaskStatus(task.id!, targetColumn.status).subscribe(response => {
      console.log('Feladat státusza frissítve az adatbázisban', response);
  
      // **POST request to update UserStatistics**
      if (targetColumn.status === 'done') {
        this.api.postCompletedTask(task.userId!, task.id!).subscribe(response => {
          console.log('UserStatistics frissítve', response);
        });
      }
    });
    
    // Feladat az oszlop frissítése után
    this.updateTaskCount();
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

  setPriority(priority: 'Alacsony' | 'Közepes' | 'Magas') {
    this.newTask.priority = priority;
  }

  onDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.newTask.dueDate = input.value;
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
      console.log(`${column.name}: ${column.tasks.length} feladat`);
    });
  }

  toggleTaskMenu(task: any) {
    task.showMenu = !task.showMenu;
  }

  selectedTask: Task | null = null;

  editTask(task: Task) {
    this.selectedTask = { ...task }; // Másolat készítése
  }

  onTaskUpdated(updatedFields: Partial<Task>) {
    const column = this.columns.find(col => col.tasks.some(t => t.id === updatedFields.id));
    if (column) {
      const index = column.tasks.findIndex(t => t.id === updatedFields.id);
      if (index !== -1) {
        column.tasks[index] = { ...column.tasks[index], ...updatedFields };
      }
    }
    this.selectedTask = null;
  }

  deleteTask(task: Task, column: Column): boolean {
    const index = column.tasks.indexOf(task);
    if (index > -1) {
        column.tasks.splice(index, 1);
        
        this.http.delete<{ message: string }>(`http://localhost:3000/tasks/${task.id}`)
            .subscribe({
                next: (response) => {
                    console.log('Feladat törölve:', response.message);
                    this.updateTaskCount();
                    
                    if(task.status != 'done'){
                      this.api.postMissedTask(task.userId!, task.id!).subscribe(response => {
                        console.log('UserStatistics frissítve (missed task)', response);
                    });
                    }
                },
                error: (error) => {
                    console.error('Hiba történt a feladat törlésénél:', error);
                }
            });

        return true;
    }
    return false;
}


  

  isInvalid(field: string) {
    return this.invalidFields.includes(field); // Visszaadja, hogy a mező hibás-e
  }
}