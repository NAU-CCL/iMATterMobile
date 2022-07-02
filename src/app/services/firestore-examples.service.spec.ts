import { TestBed } from '@angular/core/testing';

import { FirestoreExamplesService } from './firestore-examples.service';

describe('FirestoreExamplesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FirestoreExamplesService = TestBed.get(FirestoreExamplesService);
    expect(service).toBeTruthy();
  });
});
