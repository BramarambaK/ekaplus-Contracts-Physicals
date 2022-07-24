import { TestBed } from '@angular/core/testing';

import { ContractObjectService } from './contract-object.service';

describe('ContractObjectService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ContractObjectService = TestBed.get(ContractObjectService);
    expect(service).toBeTruthy();
  });
});
