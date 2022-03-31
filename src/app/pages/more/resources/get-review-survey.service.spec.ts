import { TestBed } from '@angular/core/testing';

import { GetReviewSurveyService } from './get-review-survey.service';

describe('GetReviewSurveyService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GetReviewSurveyService = TestBed.get(GetReviewSurveyService);
    expect(service).toBeTruthy();
  });
});
