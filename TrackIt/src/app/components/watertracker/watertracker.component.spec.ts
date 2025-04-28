import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WatertrackerComponent } from './watertracker.component';

describe('WatertrackerComponent', () => {
  let component: WatertrackerComponent;
  let fixture: ComponentFixture<WatertrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WatertrackerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WatertrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
