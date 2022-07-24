import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitPricingPopupComponent } from './split-pricing-popup.component';

describe('SplitPricingPopupComponent', () => {
  let component: SplitPricingPopupComponent;
  let fixture: ComponentFixture<SplitPricingPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SplitPricingPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitPricingPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
