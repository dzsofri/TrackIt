  import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { FormsModule } from '@angular/forms';
  import { RouterModule } from '@angular/router';
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
          style({ transform: 'translateX(-100%)', opacity: 1 }),
          animate('0.5s ease-out', style({ transform: 'translateX()', opacity: 1 }))
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
    constructor(private cdr: ChangeDetectorRef, private zone: NgZone) {}

    ngOnInit() {
      if (window.innerWidth <= 1076) {
        this.isKanbanVisible = false; // vagy true, attól függ mit akarsz
        this.textVisible = true; // fontos!
      }
    }
    

    
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
      console.log("Before:", JSON.stringify(this.steps, null, 2));
    
      // Lépések frissítése
      this.steps[0].completed = true;
      this.steps[0].active = false;
      this.steps[1].active = true;
    
      console.log("After:", JSON.stringify(this.steps, null, 2));
    
      // UI frissítése
      this.textState = 'hidden';
      this.textVisible = false;
      this.stepState = 'moved';  // A lépések jobbra mozdulnak
    
      // Az NgZone-on belül történő változásfigyelés
      this.zone.run(() => {
        this.cdr.detectChanges();
      });
    
      // Késleltetett megjelenítés
      setTimeout(() => {
        this.isKanbanVisible = true;
        this.kanbanState = 'visible';
    
        // Minimizáljuk a lépéseket
        this.isMinimized = true;
      }, 1000);
    }
    
  
    getStepClass(step: any): string {
      console.log(`getStepClass called for step`, step);
      // Ellenőrizzük, hogy létezik-e active vagy completed, ha nem, alapértelmezett értékeket adunk
      if (step.active) {
        return 'active';
      } else if (step.completed) {
        return 'completed';
      }
      return ''; // Üres osztály, ha egyik sincs
    }
    
    goToNextStep() {
      this.steps[1].completed = true;
      this.steps[1].active = false;
      this.steps[2].active = true;
    
      // későbbiekben navigáció vagy animáció stb.
    }
    
    
    
  }

  