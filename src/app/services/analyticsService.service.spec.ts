import { TestBed } from '@angular/core/testing';

import { AnalyticsService  } from './analyticsService.service';

describe('AnalyticsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AnalyticsService = TestBed.get(AnalyticsService);
    expect(service).toBeTruthy();
  });
});
