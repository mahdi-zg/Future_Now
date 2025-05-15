import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KioskUiComponent } from './kiosk-ui.component';

describe('KioskUiComponent', () => {
  let component: KioskUiComponent;
  let fixture: ComponentFixture<KioskUiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KioskUiComponent]
    });
    fixture = TestBed.createComponent(KioskUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
