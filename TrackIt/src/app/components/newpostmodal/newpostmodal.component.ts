import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, Output } from '@angular/core';
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
  selectedFile: File | null = null;  // A fájl tárolása
  selectedFileName: string | null = null;  // A fájl neve

  constructor(private http: HttpClient) {}

  closeModal() {
    this.closePopup.emit();
  }

  onFileSelected(event: any) {
    // Ha a fájl kiválasztásra kerül
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      this.selectedFileName = this.selectedFile.name; // A fájl neve
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
  
      const token = this.getToken(); // A token lekérése
  
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}` // Az Authorization fejlécet itt adjuk hozzá
      });
  
      // Győződj meg róla, hogy a helyes URL-t küldöd!
      this.http.post<any>('http://localhost:3000/posts', formData, { headers })
        .subscribe(response => {
          console.log('Post created', response);
          this.postSubmit.emit(response.post.id);
          this.closeModal();
        }, error => {
          console.error('Error creating post', error);
        });
    }
  }

  
  
  // Képzeld el, hogy van egy metódusod, amely visszaadja a tárolt token-t
  getToken() {
    // A token visszaadása (pl. localStorage-ból vagy egy másik helyről)
    return localStorage.getItem('authToken') || '';  // Ha nincs token, akkor üres stringet ad vissza
  }
}