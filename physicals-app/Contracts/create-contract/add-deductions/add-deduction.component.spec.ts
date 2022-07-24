import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDeductionComponent } from './add-deduction.component';

describe('AddDeductionComponent', () => {
  let component: AddDeductionComponent;
  let fixture: ComponentFixture<AddDeductionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddDeductionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDeductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
