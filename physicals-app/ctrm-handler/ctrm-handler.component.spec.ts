import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CtrmHandlerComponent } from './ctrm-handler.component';

describe('CtrmHandlerComponent', () => {
  let component: CtrmHandlerComponent;
  let fixture: ComponentFixture<CtrmHandlerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CtrmHandlerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CtrmHandlerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
