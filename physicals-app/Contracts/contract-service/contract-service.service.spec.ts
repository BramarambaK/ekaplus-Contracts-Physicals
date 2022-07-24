import { TestBed } from '@angular/core/testing';

import { ContractService } from './contract-service.service';

describe('ContractServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ContractService = TestBed.get(ContractService);
    expect(service).toBeTruthy();
  });
});
