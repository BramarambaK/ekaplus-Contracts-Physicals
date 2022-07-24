import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QaulitySpecPopupComponent } from './qaulity-spec-popup.component';

describe('QaulitySpecPopupComponent', () => {
  let component: QaulitySpecPopupComponent;
  let fixture: ComponentFixture<QaulitySpecPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QaulitySpecPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QaulitySpecPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
