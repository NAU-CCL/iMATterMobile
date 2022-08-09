import { Component, Input, OnInit, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GetReviewSurveyService } from '../../../../services/get-review-survey.service'
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-display-reviews',
  templateUrl: './display-reviews.page.html',
  styleUrls: ['./display-reviews.page.scss'],
})
export class DisplayReviewsPage implements OnInit {

  public getReviewsQuery;
  public resourceID;
  public starArray = [1,2,3,4,5];

  // Array that holds reviews that are visble to provide the allusion that reviews are being loaded as a user scrolls.
  public visibleReviewsArray = [];
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
  public questionNameArray = {};



  public showReviewButtonText = "Show Less";


  // Use input elements to receive values for these variables from parent.
  @Input('resource_name') resourceTitle; 
  @Input() reloadReviews;

  // Create output deorater to send the review avg and tag names to the parent
  @Output() averageRatingForParentEvent = new EventEmitter<number[]>();
  @Output() tagArrayForParentEvent = new EventEmitter<{}>();
  

  constructor( private reviewSurveyService: GetReviewSurveyService,
               private activatedRoute: ActivatedRoute,
               public datepipe: DatePipe )
  {  
    
  }

  ngOnInit() {
    // Get id of the resource we are displaying reviews for.
    this.resourceID = this.activatedRoute.snapshot.paramMap.get('id');
    this.getReviewsQuery = this.reviewSurveyService.getReviewsForResourceQuery( this.resourceID );

    console.log('On NGINIT');
  }

  ionViewWillEnter()
  {
    console.log('Will enter display reviews');
  }

  // Called when the parent component emits a change event to the value bound to this childs @Input property reloadReviews. 
  // This is a semi hacky way to refresh reviews after a user submits a review.
  async initializeReviewPage()
  {
    // Reset all variables used to display reviews to the user. This is not the best way this could be done. Angular element are not meant be
    // manually reloaded but we are fighting angular here and you can see how complex and scattered this can get. Avoid this if you can. If you need
    // A component to reload data when it is viewed again try to use an observable.
    // reset the review doc array when this func is called. This is because we need to reload all reviews after the user submits a review.
    this.reviewDocArray = []
    this.visibleReviewsArray = [];
    this.currentReviewRefIndex = 0;
    this.totalReviewScores = 0;

    // Reenable the infinite scroll element.
    document.getElementsByTagName('ion-infinite-scroll')[0].disabled = false;

    console.log(`Waiting to load reviews`);
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

    console.log(`Finished loading reviews`);

    let loadFive = 0;

    while(loadFive < 5)
    {
      this.loadReviewForIndex();
      loadFive++;
    }

    console.log(`Review doc array ${this.reviewDocArray}`);

    console.log(`Visble reviews ${this.visibleReviewsArray}|||||||||| INDEX IS ${this.currentReviewRefIndex}`);

    this.showNReviews = this.reviewDocArray.length;

    // Emitt an event when the review doc array is initialized and we have gotten the review average and the review tag array.
    this.sendAvgToParent(this.averageRating, this.reviewDocArray.length );

    this.sendQuestionNameArrayToParent( this.questionNameArray );

    this.reviewDocArrayLoaded = true;
  }



  // Returns a Review object.
  loadReviewForIndex()
  {
    this.visibleReviewsArray.push( this.reviewDocArray[this.currentReviewRefIndex] );

    // Class level count index keeping track of which reviews have been loaded.
    this.currentReviewRefIndex += 1;
  }


  loadData(event) {

    console.log(` Len of DOC array ${this.reviewDocArray.length}`)

    

    setTimeout( () => {

      let loadFiveReviews = 5;
      let index = 0;

      while( index < loadFiveReviews )
      {
        // If there are more reviews load more.
        if( this.currentReviewRefIndex < this.reviewDocArray.length )
        {
          /// Loads a new review into the visibleReviewsArray  object 
          this.loadReviewForIndex();
  
          index++;
        }
        else
        {
          index = 5;
        }
      }

      event.target.complete();

      console.log(`Review ref index ${this.currentReviewRefIndex}:: Review doc array len ${this.reviewDocArray.length} :: Array loaded ${this.reviewDocArrayLoaded }`);
      // App logic to determine if all data is loaded
      // and disable the infinite scroll
      if (this.currentReviewRefIndex == (this.reviewDocArray.length) && this.reviewDocArrayLoaded ) {
        event.target.disabled = true;
        console.log(`Disabling spinner`);
      }
    }, 200);
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

    //console.log(`Ang Review is ${this.averageRating}`);
  }

  generateReviewTags( reviewDoc )
  {
    let surveyQuestions: string[] = reviewDoc.survey_questions;
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
      let questionName = surveyQuestions[index];

      // check if key name tagName is in the questionNameArray object already using the in operator.
      if( questionName in this.questionNameArray )
      {
        // { 'Can Have Dog': {yes: , no: , na: }}
        // Get the object correpsonding to the tag name key. This object stores the 'score' for the current tag. Keeps track of the yes's, no's, and i dont knows
        let tagInfoObj = this.questionNameArray[ questionName ];

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
        // might need to re assign the info object to the questionNameArray.
      }
      else // Create new tag array object if none exist for the tag
      {
        // Create tag info obj
        let tagInfoObj = {tagName: tagName, yes: 0, no: 0, na: 0};

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

        this.questionNameArray[ questionName ] = tagInfoObj;
      }
    }

    //console.log(`QUESTION NAME ARRAY ${JSON.stringify(this.questionNameArray) }`);

  }

  sendAvgToParent( avg, numOfReviews )
  {
    this.averageRatingForParentEvent.emit( [avg, numOfReviews] );
  }

  sendQuestionNameArrayToParent( reviewTagArray )
  {
    this.tagArrayForParentEvent.emit( reviewTagArray );
  }

  // Checks if the current element is going to overflow.
  checkForReviewOverflow( reviewText )
  {
    // If review text is greater than 80, collapse the review.
    if( reviewText.length > 80 )
    {
      // Signal that the review should be collapsed.
      return true;
    }
    return false;

  }

  // Toggles a review between expanded and minimzed.
  expandReview( expandButtonEl: HTMLElement, reviewTextEl: HTMLElement)
  {
    let currentInnerHTML = expandButtonEl.innerHTML;
    // If review is currently expanded, show less.
    if( currentInnerHTML === 'Show Less...')
    {
      reviewTextEl.classList.add('minimized-review-text');
      expandButtonEl.innerHTML = 'Show More...';
    }
    else
    {
      // If review is currently minimized, show more.
      reviewTextEl.classList.remove('minimized-review-text');
      expandButtonEl.innerHTML = 'Show Less...';
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    console.log(`CHANGES ARRAY ${JSON.stringify(changes.reloadReviews)}`);

    // Reload reviews when the child receives a change event from the parent. This method ngOnChanges is an angular lifescycle hook that runs
    // everytime the parent updates a property passed to the child via @Input.
    this.initializeReviewPage(); // Reload reviews when a resource page is visited.
  }

}

