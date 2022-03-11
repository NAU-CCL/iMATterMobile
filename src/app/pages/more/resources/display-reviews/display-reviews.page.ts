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
  public currentReviewRefIndex = -1;

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

    
  }



  // Returns a Review object.
  loadReviewForIndex() : Review
  {
    this.currentReviewRefIndex += 1;

    console.log(`In review load func, about to wait for promise.`)

    return this.reviewRefArray[this.currentReviewRefIndex].get().then( ( docSnap ) => { 
      let docData = docSnap.data();
      console.log(`DOC SNAP BEFORE RETURN ${JSON.stringify(docData) }`)
      return docData  });
  }


  loadData(event) {
    setTimeout( async () => {
      let listElem: HTMLElement = document.getElementById('review-list');

      console.log(`Before getting review:`);

      let currentReview = await this.loadReviewForIndex();

      console.log(`After getting review:`);

      let cardContainerElem = document.createElement('div');

      cardContainerElem.innerHTML = this.generateReviewCardElem( currentReview );

      event.target.complete();

      listElem.append( cardContainerElem );

      // App logic to determine if all data is loaded
      // and disable the infinite scroll
      if (this.currentReviewRefIndex >= this.reviewRefArray.length ) {
        event.target.disabled = true;
      }
    }, 100);
  }


  generateReviewCardElem( review : Review)
  {
    console.log(`GENERATING REVIEW: ${JSON.stringify(review)}`);
    return `<ion-card>
    <ion-card-header class="ion-no-padding review-card-header-pad">

      <ion-card-title> 
        ${review.reviewSubject}
      </ion-card-title>

      <ion-card-subtitle>
        <div id="review-card-star-container" class="dis-flex" >
          <ion-icon *ngFor="let num of starArray" id="star-1" [attr.name]="num <= review.reviewRating ? 'star' : 'star-outline'" size="small"></ion-icon>
          <span>  -  ${review.reviewDate}</span>
        </div> 

        

       </ion-card-subtitle>

    </ion-card-header>
  
    <ion-card-content>

    


      <span> ${review.reviewText}</span>

    </ion-card-content>
  </ion-card>`
  }
  
}


