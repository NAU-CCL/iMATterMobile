import { TestBed } from '@angular/core/testing';

import { UserSubmissionsService } from './user-submissions.service';

describe('UserSubmissionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UserSubmissionsService = TestBed.get(UserSubmissionsService);
    expect(service).toBeTruthy();
  });
});
