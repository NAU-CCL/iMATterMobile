import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { DocumentReference } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { GetReviewSurveyService } from '../../../../services/get-review-survey.service'
import { Review } from '../review-interfaces/review-interfaces';
import { DatePipe } from '@angular/common';
import { stringify } from 'querystring';

@Component({
  selector: 'app-display-reviews',
  templateUrl: './display-reviews.page.html',
  styleUrls: ['./display-reviews.page.scss'],
})
export class DisplayReviewsPage implements OnInit {

  public getReviewsQuery;
  public resourceID;
  public starArray = [1,2,3,4,5];

  public reviewDocArray = [];
  private reviewDocArrayLoaded = false;
  public currentReviewRefIndex = 0;


  // Variables used to toggle how many reviews to show user.
  public showLessReviews = 3;
  public showAllReviews;
  public showNReviews = this.showLessReviews;

  // The current average of reviews.
  public averageRating: number;
  // Running total of review scores for a resource.
  public totalReviewScores: number = 0;

  // Array containing the name and response to each question answered in the review.
  // For example a question may ask, "Are pets allowed" and the response could be "yes, no, or dont know". We need to
  // tally the responses so we can display them to the user.
  public tagNameArray = {};



  public showReviewButtonText = "Show Less";


  @Input('resource_name') resourceTitle; 
  @Input() reviewDocsFromParent;

  // Create output deorater to send the review avg and tag names to the parent
  @Output() averageRatingForParentEvent = new EventEmitter<number[]>();
  @Output() tagArrayForParentEvent = new EventEmitter<{}>();
  

  constructor( private reviewSurveyService: GetReviewSurveyService, private activatedRoute: ActivatedRoute, public datepipe: DatePipe ) {  console.log(`Review doc array from parent ${JSON.stringify(this.reviewDocsFromParent)}`); }

  async ngOnInit() {
    // Get id of the resource we are displaying reviews for.
    this.resourceID = this.activatedRoute.snapshot.paramMap.get('id');
    this.getReviewsQuery = this.reviewSurveyService.getReviewsForResourceQuery( this.resourceID );

    console.log(`Review doc array from parent ${JSON.stringify(this.reviewDocsFromParent)}`);

    console.log(`About to wait for review ref array`);

    // Fill an array with refs to each review document in the db, we do this to avoid loading all docs immediately.
    // Call await to wait for this line of code to finish.
    await this.getReviewsQuery.get().then( querySnap =>{
      querySnap.forEach( (queryDocSnap) => {
        let queryDoc = queryDocSnap.data() 
        this.reviewDocArray.push( queryDoc );
        this.calculateReviewAverage( queryDoc );
        this.generateReviewTags( queryDoc );
        console.log(`Inside review ref array`);
      })
    })

    // Emitt an event when the review doc array is initialized and we have gotten the review average and the review tag array.
    this.sendAvgToParent(this.averageRating, this.reviewDocArray.length );

    this.sendTagNameArrayToParent( this.tagNameArray );

    this.reviewDocArrayLoaded = true;

    console.log(`Outside review ref array`);

    console.log('On NGINIT');
  }

  ionViewWillEnter()
  {
    console.log('Will enter');
  }



  // Returns a Review object.
  loadReviewForIndex() : Review
  {
    let reviewDoc = this.reviewDocArray[this.currentReviewRefIndex];

    // Class level count index keeping track of which reviews have been loaded.
    this.currentReviewRefIndex += 1;

    return reviewDoc;
  }


  loadData(event) {

    console.log(` Len of DOC array ${this.reviewDocArray.length}`)

    

    setTimeout( () => {

      let loadFiveReviews = 5;
      let index = 0;

      while( index < loadFiveReviews )
      {
        // If there are more reviews
        if( this.currentReviewRefIndex < this.reviewDocArray.length )
        {
          // await means WAIT here for the operation to complete. This function retrieves data from the db and needs to load before we can move on.
          let currentReview = this.loadReviewForIndex();
  
          index++;
        }
        else
        {
          index = 5;
        }
      }

      event.target.complete();

      this.showNReviews = this.reviewDocArray.length;

      // App logic to determine if all data is loaded
      // and disable the infinite scroll
      if (this.currentReviewRefIndex >= this.reviewDocArray.length && this.reviewDocArrayLoaded ) {
        event.target.disabled = true;
        console.log(`Disabling spinner`);
      }
    }, 100);
  }
  
  toggleShowNReviews()
  { 
    if(this.showNReviews === this.reviewDocArray.length)
    {
      this.showNReviews = this.showLessReviews;
      this.showReviewButtonText = "Show More";
    }
    else
    {
      this.showNReviews = this.reviewDocArray.length;
      this.showReviewButtonText = "Show Less";
    }
  }


  // Calulate the average review score for a resource, one review at a time.
  // Average review is rounded to the closest whole number.
  calculateReviewAverage( reviewDoc  )
  {
    this.totalReviewScores += reviewDoc.reviewRating;
    this.averageRating = this.totalReviewScores/(this.reviewDocArray.length);
    this.averageRating = Math.round(this.averageRating);

    console.log(`Ang Review is ${this.averageRating}`);
  }

  generateReviewTags( reviewDoc )
  {
    // Get the survey tag name array from the reivew doc.
    // Tags correspond to questions. They are shortened questions.
    let surveyTagsArray: string[] = reviewDoc.survey_tags;

    // Get the survey tag answers array which is the same length as the tags array.
    let surveyTagAnswers: string[] = reviewDoc.survey_answers;

    // Iterate through each tag, creating a new entry in the tag name array if the current tag has not already been added.
    for( let index = 0; index < surveyTagsArray.length; index++)
    {
      // Store the name of the tag and the response to the tag.
      let tagName = surveyTagsArray[index];
      let tagAnswer = surveyTagAnswers[index];

      // check if key name tagName is in the tagNameArray object already using the in operator.
      if( tagName in this.tagNameArray )
      {
        // { 'Can Have Dog': {yes: , no: , na: }}
        // Get the object correpsonding to the tag name key. This object stores the 'score' for the current tag. Keeps track of the yes's, no's, and i dont knows
        let tagInfoObj = this.tagNameArray[ tagName ];

        switch(tagAnswer){
          case "yes":
            tagInfoObj.yes += 1; // increment the count for the yes responses to this tag/question.
            break;
          case "no":
            tagInfoObj.no += 1;
            break;
          case "na":
            tagInfoObj.na += 1;
            break;
        }
        // might need to re assign the info object to the tagNameArray.
      }
      else // Create new tag array object if none exist for the tag
      {
        // Create tag info obj
        let tagInfoObj = {yes: 0, no: 0, na: 0};

        // properly increment the correct answer to the tag/question.
        switch(tagAnswer){
          case "yes":
            tagInfoObj.yes += 1; // increment the count for the yes responses to this tag/question.
            break;
          case "no":
            tagInfoObj.no += 1;
            break;
          case "na":
            tagInfoObj.na += 1;
            break;
        }

        this.tagNameArray[ tagName ] = tagInfoObj;
      }
    }

    console.log(`TAG NAME ${JSON.stringify(this.tagNameArray) }`);

  }

  sendAvgToParent( avg, numOfReviews )
  {
    this.averageRatingForParentEvent.emit( [avg, numOfReviews] );
  }

  sendTagNameArrayToParent( reviewTagArray )
  {
    this.tagArrayForParentEvent.emit( reviewTagArray );
  }
}

