import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProfileBejegyzesComponent } from '../profile-bejegyzes/profile-bejegyzes.component';
import { NewpostmodalComponent } from '../newpostmodal/newpostmodal.component';
import { NewpostComponent } from '../newpost/newpost.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, ProfileBejegyzesComponent, NewpostComponent],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.scss'
})
export class FeedComponent {

}
