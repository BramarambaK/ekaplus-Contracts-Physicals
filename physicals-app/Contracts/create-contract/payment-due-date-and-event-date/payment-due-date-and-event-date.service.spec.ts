import { TestBed } from '@angular/core/testing';

import { PaymentDueDateAndEventDateService } from './payment-due-date-and-event-date.service';

describe('PaymentDueDateAndEventDateService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PaymentDueDateAndEventDateService = TestBed.get(PaymentDueDateAndEventDateService);
    expect(service).toBeTruthy();
  });
});
