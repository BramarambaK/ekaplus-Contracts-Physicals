import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SecondaryCostPopupComponent } from './secondary-cost-popup.component';

describe('SecondaryCostPopupComponent', () => {
  let component: SecondaryCostPopupComponent;
  let fixture: ComponentFixture<SecondaryCostPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SecondaryCostPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecondaryCostPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
