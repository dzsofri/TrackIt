import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-watertracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './watertracker.component.html',
  styleUrl: './watertracker.component.scss'
})
export class WatertrackerComponent {

}
