import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaviPlannerKezeloComponent } from './havi-planner-kezelo.component';

describe('HaviPlannerKezeloComponent', () => {
  let component: HaviPlannerKezeloComponent;
  let fixture: ComponentFixture<HaviPlannerKezeloComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HaviPlannerKezeloComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HaviPlannerKezeloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
