import { TestBed } from '@angular/core/testing';

import { LearningModuleService } from './learning-module.service';

describe('LearningModuleService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LearningModuleService = TestBed.get(LearningModuleService);
    expect(service).toBeTruthy();
  });
});
