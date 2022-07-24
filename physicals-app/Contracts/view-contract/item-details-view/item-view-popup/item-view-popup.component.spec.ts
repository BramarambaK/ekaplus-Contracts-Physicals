import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemViewPopupComponent } from './item-view-popup.component';

describe('ItemViewPopupComponent', () => {
  let component: ItemViewPopupComponent;
  let fixture: ComponentFixture<ItemViewPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemViewPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemViewPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
