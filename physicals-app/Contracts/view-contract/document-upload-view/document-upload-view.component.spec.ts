import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentUploadViewComponent } from './document-upload-view.component';

describe('DocumentUploadViewComponent', () => {
  let component: DocumentUploadViewComponent;
  let fixture: ComponentFixture<DocumentUploadViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentUploadViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentUploadViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
