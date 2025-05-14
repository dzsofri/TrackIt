import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { KanbanComponent } from '../kanban/kanban.component';
import { trigger, state, style, transition, animate, query } from '@angular/animations';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, KanbanComponent],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 1 }),
        animate('0.5s ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ]),
    trigger('moveRight', [
      state('default', style({ transform: 'translateX(0)', scale: 1 })),
      state('moved', style({ transform: 'translateX(145%)', scale: 1 })),
      state('reduced', style({ transform: 'translateX(140%)', scale: 1.2 })),
      transition('default => moved', [
        animate('1s cubic-bezier(0.25, 0.8, 0.25, 1)')
      ]),
      transition('moved => reduced', [
        animate('0.5s ease-out')
      ])
    ]),
    trigger('fadeOut', [
      transition('visible => hidden', [
        animate('1s ease-out', style({
          transform: 'translateX(-150%)',
          opacity: 0,
          visibility: 'hidden'
        }))
      ])
    ]),
    trigger('allAnimations', [  
      transition(':enter', [
        query('@slideIn', [animate('0.5s ease-out')], { optional: true }),
        query('@moveRight', [animate('1s cubic-bezier(0.25, 0.8, 0.25, 1)')], { optional: true }),
        query('@fadeOut', [animate('1s ease-out')], { optional: true })
      ])
    ])
  ]
})

export class WelcomeComponent {
   constructor(private router: Router) {} // 🔹 Router injektálása


   steps = [
    { id: 1, text: 'Üdvözlünk!', active: true, completed: false },
    { id: 2, text: 'ToDo lista és Kanban tábla létrehozása', active: false, completed: false },
    { id: 3, text: 'TrackIt funkciók felfedezése', active: false, completed: false },
  ];

  isKanbanVisible = false;
  isMinimized = false;
  stepState = 'default';
  kanbanState: any;
  textState = 'visible';
  textVisible = true;

  startApp() {
    // Állapot visszaállítás (ha szükséges)
    this.steps = [
      { id: 1, text: 'Üdvözlünk!', active: true, completed: false },
      { id: 2, text: 'ToDo lista és Kanban tábla létrehozása', active: false, completed: false },
      { id: 3, text: 'TrackIt funkciók felfedezése', active: false, completed: false },
    ];
    this.textVisible = true;
    this.textState = 'visible';
    this.stepState = 'default';
    this.isMinimized = false;
    this.isKanbanVisible = false;
    this.kanbanState = null;

    // Elindítja az animációt
    setTimeout(() => {
      this.textState = 'hidden';
      this.textVisible = false;
      this.stepState = 'moved';

      setTimeout(() => {
        this.isKanbanVisible = true;
        this.kanbanState = 'visible';
        this.isMinimized = true;

        // 🔹 Navigáció a profil oldalra animáció után
        setTimeout(() => {
          this.router.navigate(['/profile']);
        }, 1000000000000000000000000); // tetszés szerint módosíthatod

      }, 100000000000000000000000000);
    }, 0);
  }

  

  getStepClass(step: number): string {
    if (this.steps[step - 1].active) {
      return 'active';
    } else if (this.steps[step - 1].completed) {
      return 'completed';
    }
    return '';
  }
}

