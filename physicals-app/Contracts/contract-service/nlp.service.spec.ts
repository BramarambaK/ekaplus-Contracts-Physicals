import { TestBed } from '@angular/core/testing';

import { NLPService } from './nlp.service';

describe('NLPService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NLPService = TestBed.get(NLPService);
    expect(service).toBeTruthy();
  });
});
