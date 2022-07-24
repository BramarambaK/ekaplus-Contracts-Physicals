import { TestBed } from '@angular/core/testing';

import { GeneralDetailsResolverService } from './general-details-resolver.service';

describe('GeneralDetailsResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GeneralDetailsResolverService = TestBed.get(GeneralDetailsResolverService);
    expect(service).toBeTruthy();
  });
});
