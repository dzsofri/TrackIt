import { Component } from '@angular/core';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent {
  steps = [
    { id: 1, text: 'Üdvözlünk!', active: true },
    { id: 2, text: 'ToDo lista és Kanban tábla létrehozása', active: false },
    { id: 3, text: 'TrackIt funkciók felfedezése', active: false },
  ];
}
