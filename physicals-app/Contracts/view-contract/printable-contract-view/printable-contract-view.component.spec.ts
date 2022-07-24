import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintableContractViewComponent } from './printable-contract-view.component';

describe('PrintableContractViewComponent', () => {
  let component: PrintableContractViewComponent;
  let fixture: ComponentFixture<PrintableContractViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintableContractViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintableContractViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
