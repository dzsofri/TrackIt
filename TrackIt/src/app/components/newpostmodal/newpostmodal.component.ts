import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-newpostmodal',
  imports: [CommonModule, FormsModule],
  templateUrl: './newpostmodal.component.html',
  styleUrls: ['./newpostmodal.component.scss']
})
export class NewpostmodalComponent {
  @Output() closePopup = new EventEmitter<void>();
  @Output() postSubmit = new EventEmitter<string>();

  postContent: string = '';
  postTitle: string = '';
  postStatus: string = 'published';
  selectedFile: File | null = null;
  selectedFileName: string | null = null;

  constructor(private http: HttpClient) {}

  closeModal() {
    this.closePopup.emit();
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      this.selectedFileName = this.selectedFile.name;
    }
  }

  submitPost() {
    if (this.postContent.trim()) {
      const formData = new FormData();
      formData.append('title', this.postTitle);
      formData.append('body', this.postContent);
      formData.append('status', this.postStatus);
  
      if (this.selectedFile) {
        formData.append('picture', this.selectedFile, this.selectedFile.name);
      }
  
      // Token a localStorage-ból
      const token = localStorage.getItem('trackit');
      if (!token) {
        console.error('Nincs érvényes token!');
        return;
      }
  
      this.http.post<any>('http://localhost:3000/posts', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).subscribe({
        next: (response) => {
          console.log('Post created', response);
          this.postSubmit.emit(response.post.id);
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating post', error);
          if (error.status === 401) {
            // Redirect to login page or show message
            alert('Nincs bejelentkezve! Kérem jelentkezzen be!');
            // Esetleg redirect: this.router.navigate(['/login']);
          }
        }
    }
  
  
  
  )}
}
};
