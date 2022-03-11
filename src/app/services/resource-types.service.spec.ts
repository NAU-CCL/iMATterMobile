import { TestBed } from '@angular/core/testing';

import { ResourceTypesService } from './resource-types.service';

describe('ResourceTypesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ResourceTypesService = TestBed.get(ResourceTypesService);
    expect(service).toBeTruthy();
  });
});
