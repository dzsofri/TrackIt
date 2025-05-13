import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditpostmodalComponent } from './editpostmodal.component';

describe('EditpostmodalComponent', () => {
  let component: EditpostmodalComponent;
  let fixture: ComponentFixture<EditpostmodalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditpostmodalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditpostmodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
