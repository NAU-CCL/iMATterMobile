import { TestBed } from '@angular/core/testing';

import { AuthServiceProvider } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AuthServiceProvider = TestBed.get(AuthServiceProvider);
    expect(service).toBeTruthy();
  });
});
