import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GymtrackerComponent } from './gymtracker.component';

describe('GymtrackerComponent', () => {
  let component: GymtrackerComponent;
  let fixture: ComponentFixture<GymtrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GymtrackerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GymtrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
