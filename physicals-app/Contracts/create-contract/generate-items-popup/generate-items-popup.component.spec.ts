import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateItemsPopupComponent } from './generate-items-popup.component';

describe('GenerateItemsPopupComponent', () => {
  let component: GenerateItemsPopupComponent;
  let fixture: ComponentFixture<GenerateItemsPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenerateItemsPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateItemsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
