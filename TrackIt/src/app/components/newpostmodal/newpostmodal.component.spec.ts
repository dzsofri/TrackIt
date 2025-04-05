import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewpostmodalComponent } from './newpostmodal.component';

describe('NewpostmodalComponent', () => {
  let component: NewpostmodalComponent;
  let fixture: ComponentFixture<NewpostmodalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewpostmodalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewpostmodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
