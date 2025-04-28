import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gymtracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gymtracker.component.html',
  styleUrl: './gymtracker.component.scss'
})
export class GymtrackerComponent {

}
