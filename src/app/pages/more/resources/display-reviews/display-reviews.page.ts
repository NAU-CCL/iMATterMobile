import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { GetReviewSurveyService } from '../../../../services/get-review-survey.service'
import { Review } from '../review-interfaces/review-interfaces';

@Component({
  selector: 'app-display-reviews',
  templateUrl: './display-reviews.page.html',
  styleUrls: ['./display-reviews.page.scss'],
})
export class DisplayReviewsPage implements OnInit {

  
  public getReviewsObs: Observable<Review[]>;
  public getReviewsQuery;
  public resourceID;
  public starArray = [1,2,3,4,5];

  @Input('resource_name') resourceTitle; 
  

  constructor( private reviewSurveyService: GetReviewSurveyService, private activatedRoute: ActivatedRoute ) { }

  ngOnInit() {
    this.resourceID = this.activatedRoute.snapshot.paramMap.get('id');
    this.getReviewsObs = this.reviewSurveyService.getReviewsForResource( this.resourceID );
    this.getReviewsQuery = this.reviewSurveyService.getReviewsForResourceQuery( this.resourceID );
  }

}
