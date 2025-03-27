import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertModalComponent } from './alert-modal.component';
import { CommonModule } from '@angular/common';  // Szükséges a CommonModule importálása
import { By } from '@angular/platform-browser';

describe('AlertModalComponent', () => {
  let component: AlertModalComponent;
  let fixture: ComponentFixture<AlertModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AlertModalComponent],
      imports: [CommonModule]  // CommonModule importálása szükséges az ngIf használatához
    });

    fixture = TestBed.createComponent(AlertModalComponent);
    component = fixture.componentInstance;
  });

  it('should show modal when visible is true', () => {
    component.visible = true;
    fixture.detectChanges();  // Frissíti a DOM-ot

    const modal = fixture.debugElement.query(By.css('.modal'));
    expect(modal).toBeTruthy();  // Ellenőrzi, hogy a modal megjelenik
  });

  it('should hide modal when visible is false', () => {
    component.visible = false;
    fixture.detectChanges();  // Frissíti a DOM-ot

    const modal = fixture.debugElement.query(By.css('.modal'));
    expect(modal).toBeFalsy();  // Ellenőrzi, hogy a modal el van rejtve
  });

  it('should display correct type icon', () => {
    component.type = 'success';
    fixture.detectChanges();

    const icon = fixture.debugElement.query(By.css('span'));
    expect(icon.nativeElement.textContent).toContain('✅');  // Ellenőrzi, hogy a megfelelő ikont jeleníti meg
  });

  it('should emit close event when OK button is clicked', () => {
    spyOn(component.close, 'emit');  // Figyeli, hogy a close esemény ki van-e küldve
    component.visible = true;
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();  // Kattintás a gombra

    expect(component.close.emit).toHaveBeenCalled();  // Ellenőrzi, hogy a close esemény ki lett küldve
  });
});
