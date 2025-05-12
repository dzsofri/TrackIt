import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayDetailsModalComponent } from './day-details-modal.component';

describe('DayDetailsModalComponent', () => {
  let component: DayDetailsModalComponent;
  let fixture: ComponentFixture<DayDetailsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DayDetailsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DayDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
