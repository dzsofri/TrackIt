import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LostPassComponent } from './lost-pass.component';

describe('LostPassComponent', () => {
  let component: LostPassComponent;
  let fixture: ComponentFixture<LostPassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LostPassComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LostPassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
