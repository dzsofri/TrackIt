import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { KanbanComponent } from '../kanban/kanban.component';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, KanbanComponent],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),  // Indulás állapot
        animate('0.8s ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ]),
    trigger('moveRight', [
      state('default', style({ transform: 'translateX(0)' })),
      state('moved', style({ transform: 'translateX(90%)' })),
      transition('default => moved', [
        animate('1s cubic-bezier(0.25, 0.8, 0.25, 1)')
      ])
    ]),
    trigger('fadeOut', [
      transition('visible => hidden', [
        animate('1s ease-out', style({
          transform: 'translateX(-150%)',
          opacity: 0,
          visibility: 'hidden'  // Helyettesítve a display: 'none' helyett
        }))
      ])
    ])
  ]
})
export class WelcomeComponent {
  steps = [
    { id: 1, text: 'Üdvözlünk!', active: true, completed: false },
    { id: 2, text: 'ToDo lista és Kanban tábla létrehozása', active: false, completed: false },
    { id: 3, text: 'TrackIt funkciók felfedezése', active: false, completed: false },
  ];

  isKanbanVisible = false;
  stepState = 'default';
  kanbanState: any;
  textState = 'visible';

  textVisible = true; // Az elején a szöveg látható

  startApp() {
    this.steps[0].completed = true;
    this.steps[0].active = false;
    this.steps[1].active = true;
  
    // Szöveg eltűnésének indítása
    this.textState = 'hidden';
    this.textVisible = false; // Eltünteti a szöveget a DOM-ból
  
    // Steps-container jobbra csúszik
    this.stepState = 'moved';
  
    // Kanban megjelenítése késleltetéssel
    setTimeout(() => {
      this.isKanbanVisible = true;
      this.kanbanState = 'visible'; // ha kell animációhoz állapot
    }, 1000);
  }
  

  
}