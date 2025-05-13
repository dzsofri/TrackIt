import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-customtracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customtracker.component.html',
  styleUrl: './customtracker.component.scss'
})
export class CustomtrackerComponent {

}
