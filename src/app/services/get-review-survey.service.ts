import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentData, Query } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { ReviewQuestions } from '../pages/more/resources/review-interfaces/review-interfaces' ;
import { Review } from '../pages/more/resources/review-interfaces/review-interfaces' ;

@Injectable({
  providedIn: 'root'
})

export class GetReviewSurveyService {

  public surveyCollection: AngularFirestoreCollection;

  constructor( private afs: AngularFirestore ) {

    //this.generateReviewQuestionsCollec();

   }

   generateReviewQuestionsCollec()
   {
    let reviewQuestions = this.afs.collection<ReviewQuestions>('resourceReviewQuestions');

    reviewQuestions.add({ review_questions_id: 1, is_current: true, review_questions: ['Can have dog?', 'Can use kratom?', 'Couples Allowed?', 'Is co-ed?'], review_question_types: ['all','all','all','all'], question_tags: ['Dogs Allowed', 'Kratom Allowed', 'Couples Allowed', 'Is Co-ed'] });

   }

   // Returns a Query object that contains a query snap shot which contains a document snapshot of the resourceReviewQuestions document
  getReviewQuestionsForResources( ) : Query
  {
    // This code returns a query, you can call .get on a query to get a promise that returns a query snapshot!
    // Query snapshot contains zero or more DocumentSnapshots. Use forEach on the querySnapshot to iterate through the DocumentSnapshots
    // Call .data on a Document snapshot to get that docs data.
    return this.afs.collection<ReviewQuestions[]>('resourceReviewQuestions').ref.where('is_current','==', true );

    
  }


  // Get all reviews for a resource.
  getReviewsForResource( resource_id: string): Observable<Review[]>
  {
    console.log(`Resource ID TO QUERY IS ${resource_id}`);
    return this.afs.collection<Review>("resourceReviews", ref => ref.where('resourceID','==', resource_id)).valueChanges();
  }

  getReviewsForResourceQuery( resource_id: string )
  {
    return this.afs.collection<Review[]>("resourceReviews").ref.where('resourceID','==', resource_id);
  }

}
