import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovePopupComponent } from './approve-popup.component';

describe('ApprovePopupComponent', () => {
  let component: ApprovePopupComponent;
  let fixture: ComponentFixture<ApprovePopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApprovePopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprovePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
