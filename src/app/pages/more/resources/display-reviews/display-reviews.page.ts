import { Component, Input, OnInit } from '@angular/core';
import { DocumentReference } from '@angular/fire/firestore';
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

  public reviewRefArray = [];
  public reviewDocArray = [];
  public currentReviewRefIndex = 0;


  // Variables used to toggle how many reviews to show user.
  public showLessReviews = 3;
  public showAllReviews;
  public showNReviews = this.showLessReviews;

  public showReviewButtonText = "Show Less";


  @Input('resource_name') resourceTitle; 
  

  constructor( private reviewSurveyService: GetReviewSurveyService, private activatedRoute: ActivatedRoute ) { }

  ngOnInit() {
    this.resourceID = this.activatedRoute.snapshot.paramMap.get('id');
    this.getReviewsObs = this.reviewSurveyService.getReviewsForResource( this.resourceID );
    this.getReviewsQuery = this.reviewSurveyService.getReviewsForResourceQuery( this.resourceID );


    // Fill an array with refs to each review document in the db, we do this to avoid loading all docs immediately.
    this.getReviewsQuery.get().then( querySnap =>{
      querySnap.forEach( (queryDocSnap) => {
        this.reviewRefArray.push(queryDocSnap.ref)
      })
    })

    console.log('On NGINIT');
  }

  ionViewWillEnter()
  {
    console.log('Will enter');
  }



  // Returns a Review object.
  loadReviewForIndex() : Review
  {
    //console.log(`In review load func, about to wait for promise.`)

    // We have an array of review references. We access a reference and call get and then to retrieve the actual document the ref refers to.
    // We use an array of references to save data, we dont want to load all the reviews as soon as the user visits this page as it is wasteful.
    return this.reviewRefArray[this.currentReviewRefIndex].get().then( ( docSnap ) => { 
      let docData = docSnap.data();

      //console.log(`DOC SNAP BEFORE RETURN ${JSON.stringify(docData) }`)

      // Class level count index keeping track of which reviews have been loaded.
      this.currentReviewRefIndex += 1;

      return docData  });

    
  }


  loadData(event) {

    console.log(`LENGTH OF REVIEW DOC ARRAY ${this.reviewDocArray.length} len of ref array ${this.reviewRefArray.length}`)

    

    setTimeout( async () => {

      let loadFiveReviews = 5;
      let index = 0;

      while( index < loadFiveReviews )
      {
        // If there are more reviews
        if( this.currentReviewRefIndex < this.reviewRefArray.length )
        {
          // await means WAIT here for the operation to complete. This function retrieves data from the db and needs to load before we can move on.
          let currentReview = await this.loadReviewForIndex();
    
          this.appendReviewToArray( currentReview );
  
          index++;
        }
        else
        {
          index = 5;
        }
      }

      event.target.complete();

      this.showNReviews = this.reviewRefArray.length;

      // App logic to determine if all data is loaded
      // and disable the infinite scroll
      if (this.currentReviewRefIndex >= this.reviewRefArray.length ) {
        event.target.disabled = true;
        console.log(`Disabling spinner`);
      }
    }, 100);
  }


  // Appends the review object to the array of reviews for display.
  appendReviewToArray( review : Review)
  {
    this.reviewDocArray.push(review);
  }
  
  toggleShowNReviews()
  { 
    if(this.showNReviews === this.reviewRefArray.length)
    {
      this.showNReviews = this.showLessReviews;
      this.showReviewButtonText = "Show More";
    }
    else
    {
      this.showNReviews = this.reviewRefArray.length;
      this.showReviewButtonText = "Show Less";
    }
  }
}

