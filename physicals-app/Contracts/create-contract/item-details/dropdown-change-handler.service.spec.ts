import { TestBed } from '@angular/core/testing';

import { DropdownChangeHandlerService } from './dropdown-change-handler.service';

describe('DropdownChangeHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DropdownChangeHandlerService = TestBed.get(DropdownChangeHandlerService);
    expect(service).toBeTruthy();
  });
});
