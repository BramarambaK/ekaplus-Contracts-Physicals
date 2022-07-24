import { TestBed } from '@angular/core/testing';

import { ItemNoService } from './item-no.service';

describe('ItemNoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ItemNoService = TestBed.get(ItemNoService);
    expect(service).toBeTruthy();
  });
});
