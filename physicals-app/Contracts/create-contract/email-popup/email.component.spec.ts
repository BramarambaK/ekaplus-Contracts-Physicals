import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Email } from './email.component';

describe('NgbdModalConfig', () => {
  let component: Email;
  let fixture: ComponentFixture<Email>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [Email]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Email);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
