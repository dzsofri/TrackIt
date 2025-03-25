import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TaskEditComponent } from '../task-edit/task-edit.component';
import { environment } from '../../environments/environment';
import { ApiService } from '../../services/api.service';



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
  imports: [CommonModule, FormsModule, TaskEditComponent],
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.scss']
})



export class KanbanComponent implements OnInit {
  noTasksMessage: string | null = null; // 💡 Üzenet tárolására

  private tokenName = environment.tokenName;
  
  columns: Column[] = [
    { name: 'Teendők', status: 'todo', tasks: [] },
    { name: 'Folyamatban', status: 'in-progress', tasks: [] },
    { name: 'Kész', status: 'done', tasks: [] }
  ];
  

  getToken():String | null{
    return localStorage.getItem(this.tokenName);
  }


tokenHeader():{ headers: HttpHeaders }{
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return { headers }
  }


  draggedTask: Task | null = null;
  draggedFrom: Column | null = null;
  newTask: Task = this.createEmptyTask();

  constructor(private http: HttpClient, private api: ApiService) {}

  ngOnInit() {
    this.http.get<{ message?: string; tasks: Task[] }>("http://localhost:3000/tasks")
      .subscribe({
        next: (response) => {
          console.log("Feladatok betöltve:", response.tasks);

          // Az oszlopok kiürítése az új betöltéshez
          this.columns.forEach(column => column.tasks = []);

          // Ha nincsenek feladatok, figyelmeztetés kiírása
          if (response.tasks.length === 0) {
            console.warn(response.message || "Nincsenek feladatok az adatbázisban!");
            this.noTasksMessage = response.message || "Nincsenek feladatok az adatbázisban!"; // UI-nak tárolás
            return;
          }

          // A feladatok hozzáadása a megfelelő oszlopokhoz
          response.tasks.forEach(task => {
            console.log('Task:', task); // Nyomtatás ellenőrzéshez

            if (task.status === 'todo') {
              this.columns[0].tasks.push(task); // Teendők oszlop
            } else if (task.status === 'in-progress') {
              this.columns[1].tasks.push(task); // Folyamatban oszlop
            } else if (task.status === 'done') {
              this.columns[2].tasks.push(task); // Kész oszlop
            }
          });

          // Az oszlopok kiírása a konzolra ellenőrzéshez
          console.log('Updated columns:', this.columns);
        },
        error: (error) => {
          console.error("Hiba történt a feladatok lekérdezésekor:", error);
          this.noTasksMessage = "Hiba történt a feladatok betöltésekor.";
        }
      });
}

  
  // **Új feladat inicializálása**
  private createEmptyTask(): Task {
    return {id:'', title: '', description: '', dueDate: '', priority: 'Közepes', status: 'todo' };
  }
  

  // **Új feladat hozzáadása**
  addTask() {
    if (!this.newTask.title.trim() || !this.newTask.dueDate) {
      console.warn('A cím és a határidő megadása kötelező!');
      return;
    }
  
    const taskToSend: Task = {
      id: '',
      title: this.newTask.title.trim(),
      description: this.newTask.description.trim() || "",
      dueDate: this.newTask.dueDate,
      priority: this.newTask.priority || "Közepes",
      status: "todo" // Kezdetben a "todo" oszlopban lesz
      ,
      
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


  // **Feladat áthelyezése másik oszlopba**
  // A status frissítése PATCH kéréssel a backendben
onDrop(event: DragEvent, targetColumn: Column) {
  event.preventDefault();
  if (this.draggedTask && this.draggedFrom && this.draggedFrom !== targetColumn) {
      // Feladat áthelyezése az új oszlopba
      this.draggedFrom.tasks = this.draggedFrom.tasks.filter(t => t !== this.draggedTask);
      targetColumn.tasks.push(this.draggedTask);

      // Frissítjük a task státuszát lokálisan
      this.draggedTask.status = targetColumn.status;

      // Backend hívás a státusz frissítésére
      this.api.updateTaskStatus(this.draggedTask.id!, targetColumn.status!).subscribe(response => {
          console.log('Feladat státusza frissítve az adatbázisban', response);
      });

      // Számláló frissítése minden oszlopnál
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
        // Csak az érkező mezőket frissítjük
        column.tasks[index] = { ...column.tasks[index], ...updatedFields };
      }
    }
    this.selectedTask = null;
  }
  
  
  deleteTask(task: Task, column: Column) {
    const index = column.tasks.indexOf(task);
    if (index > -1) {
      // Törlés az oszlopból
      column.tasks.splice(index, 1);
  
      // HTTP kérés küldése a backendnek a feladat törlésére
      this.http.delete<{ message: string }>(`http://localhost:3000/tasks/${task.id}`)
        .subscribe({
          next: (response) => {
            console.log('Feladat törölve:', response.message);
            this.updateTaskCount();
          },
          error: (error) => {
            console.error('Hiba történt a feladat törlésénél:', error);
          }
        });
    }
  }
  
  

}