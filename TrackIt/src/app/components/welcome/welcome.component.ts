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
      transition(':enter', [ // Az elem belépésekor
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('0.8s ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [ // Ha szükséges kilépő animáció
        animate('0.5s ease-in', style({ transform: 'translateX(-100%)', opacity: 0 }))
      ])
    ]),
    trigger('moveRight', [
      state('default', style({ transform: 'translateX(0)' })),
      state('moved', style({ transform: 'translateX(40%)' })),
      transition('default => moved', [
        animate('1s cubic-bezier(0.25, 0.8, 0.25, 1)')
      ]),
    ]),
    trigger('slideIn', [
      state('hidden', style({ transform: 'translateX(-100%)', opacity: 0 })),
      state('visible', style({ transform: 'translateX(0)', opacity: 1 })),
      transition('hidden => visible', [
        animate('1s cubic-bezier(0.25, 0.8, 0.25, 1)')
      ]),
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


  startApp() {
    this.steps[0].completed = true;
    this.steps[0].active = false;
    this.steps[1].active = true;
  
    // Szöveg eltűnik
    this.textState = 'hidden';
  
    // Steps-container jobbra csúszik
    this.stepState = 'moved';
  
    // Kanban konténer megjelenítése késleltetéssel
    setTimeout(() => {
      this.isKanbanVisible = true;
    }, 1000); // Az animáció teljes időtartama
}

}
