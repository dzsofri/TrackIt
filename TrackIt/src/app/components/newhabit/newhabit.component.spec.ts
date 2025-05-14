import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewhabitComponent } from './newhabit.component';

describe('NewhabitComponent', () => {
  let component: NewhabitComponent;
  let fixture: ComponentFixture<NewhabitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewhabitComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewhabitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
