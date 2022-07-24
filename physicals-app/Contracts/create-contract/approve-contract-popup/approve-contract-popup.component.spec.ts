import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveContractPopupComponent } from './approve-contract-popup.component';

describe('ApproveContractPopupComponent', () => {
  let component: ApproveContractPopupComponent;
  let fixture: ComponentFixture<ApproveContractPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApproveContractPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveContractPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
