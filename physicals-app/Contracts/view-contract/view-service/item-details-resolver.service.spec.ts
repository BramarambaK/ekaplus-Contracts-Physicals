import { TestBed } from '@angular/core/testing';

import { ItemDetailsResolverService } from './item-details-resolver.service';

describe('ItemDetailsResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ItemDetailsResolverService = TestBed.get(ItemDetailsResolverService);
    expect(service).toBeTruthy();
  });
});
