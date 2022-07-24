import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValuationDetailsComponent } from './valuation-details.component';

describe('ValuationDetailsComponent', () => {
  let component: ValuationDetailsComponent;
  let fixture: ComponentFixture<ValuationDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValuationDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValuationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
