import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-newpostmodal',
  imports: [CommonModule, FormsModule],
  templateUrl: './newpostmodal.component.html',
  styleUrls: ['./newpostmodal.component.scss']
})
export class NewpostmodalComponent {
  @Output() closePopup = new EventEmitter<void>();
  @Output() postSubmit = new EventEmitter<any>();

  postTitle: string = '';      // Cím változó
  postContent: string = '';    // Leírás változó
  postStatus: string = 'published';  // Alapértelmezett státusz
  selectedFile: File | null = null;   // Kép fájl
  selectedFileName: string | null = null;  // Kép neve
  imagePreviewUrl: string | null = null;  // Kép előnézete

  constructor(private http: HttpClient, private authService: AuthService) {}

  // A fájl kiválasztása
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      this.selectedFileName = this.selectedFile.name;
  
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  // A modal bezárása
  closeModal() {
    this.closePopup.emit();
  }

  // Poszt beküldése
  submitPost() {
    if (this.postContent.trim() === '' || this.postTitle.trim() === '') {
      alert('Kérlek, töltsd ki a cím és a leírás mezőket!');
      return;
    }

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
        console.log('Poszt létrehozva', response);
        this.postSubmit.emit(response.post.id);  // Esemény küldése a szülő komponensnek
        this.closeModal();  // A modal bezárása
      },
      error: (error) => {
        console.error('Hiba a poszt létrehozásakor', error);
        if (error.status === 401) {
          alert('Nincs bejelentkezve! Kérem jelentkezzen be!');
        }
      }
    });
  }
}