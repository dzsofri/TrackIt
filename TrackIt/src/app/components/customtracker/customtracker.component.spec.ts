import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomtrackerComponent } from './customtracker.component';

describe('CustomtrackerComponent', () => {
  let component: CustomtrackerComponent;
  let fixture: ComponentFixture<CustomtrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomtrackerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomtrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
