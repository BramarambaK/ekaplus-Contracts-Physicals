import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RINsComponent } from './rins.component';

describe('RINsComponent', () => {
  let component: RINsComponent;
  let fixture: ComponentFixture<RINsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RINsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RINsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
