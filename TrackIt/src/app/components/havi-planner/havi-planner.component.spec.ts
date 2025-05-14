import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaviPlannerComponent } from './havi-planner.component';

describe('HaviPlannerComponent', () => {
  let component: HaviPlannerComponent;
  let fixture: ComponentFixture<HaviPlannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HaviPlannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HaviPlannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
