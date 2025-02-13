import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  activeTab: string = 'statisztika';

  setActiveTab(tabName: string) {
    this.activeTab = tabName;
  }
}
