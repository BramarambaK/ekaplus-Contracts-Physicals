import { TestBed } from '@angular/core/testing';

import { Urls } from './urls';

describe('UrlService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: Urls = TestBed.get(Urls);
    expect(service).toBeTruthy();
  });
});
