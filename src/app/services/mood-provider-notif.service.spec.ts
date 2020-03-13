import { TestBed } from '@angular/core/testing';

import { MoodProviderNotifService } from './mood-provider-notif.service';

describe('MoodProviderNotifService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MoodProviderNotifService = TestBed.get(MoodProviderNotifService);
    expect(service).toBeTruthy();
  });
});
