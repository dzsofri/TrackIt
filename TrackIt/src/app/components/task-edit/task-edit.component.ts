import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Task {
  id?: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'Alacsony' | 'Közepes' | 'Magas';
  status: 'todo' | 'in-progress' | 'done';
}

@Component({
  selector: 'app-task-edit',
  imports: [CommonModule, FormsModule],
  templateUrl: './task-edit.component.html',
  styleUrl: './task-edit.component.scss'
})
export class TaskEditComponent {
  @Input() task!: Task;
  @Output() closePopup = new EventEmitter<void>();
  @Output() taskUpdated = new EventEmitter<Task>();

  constructor(private http: HttpClient) {}

  saveChanges() {
    this.http.put<{ message: string, task: Task }>(`http://localhost:3000/tasks/${this.task.id}`, this.task)
      .subscribe({
        next: (response) => {
          console.log('Feladat frissítve:', response.task);
          this.taskUpdated.emit(response.task);
          this.closePopup.emit();
        },
        error: (error) => console.error('Hiba történt:', error)
      });
  }

  cancel() {
    this.closePopup.emit();
  }

}
