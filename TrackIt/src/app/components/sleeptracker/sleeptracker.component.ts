import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sleeptracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sleeptracker.component.html',
  styleUrl: './sleeptracker.component.scss'
})
export class SleeptrackerComponent {

}
