import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralDetailsViewComponent } from './general-details-view.component';

describe('GeneralDetailsViewComponent', () => {
  let component: GeneralDetailsViewComponent;
  let fixture: ComponentFixture<GeneralDetailsViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralDetailsViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralDetailsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
