import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractsHomeComponent } from './contracts-home.component';

describe('ContractsHomeComponent', () => {
  let component: ContractsHomeComponent;
  let fixture: ComponentFixture<ContractsHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractsHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractsHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
