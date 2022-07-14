import { Injectable } from '@angular/core';
import { ReviewQuestions } from '../pages/more/resources/review-interfaces/review-interfaces';
import {AngularFirestore, AngularFirestoreCollection, DocumentData, Query } from '@angular/fire/compat/firestore';


@Injectable({
  providedIn: 'root'
})
export class ResourceTypesService {

  constructor( private afs: AngularFirestore ) { }


   // Returns a Query object that contains a query snap shot which contains a document snapshot of the resourceReviewQuestions document
   getResourceTypes() : Query
   {
     // This code returns a query, you can call .get on a query to get a promise that returns a query snapshot!
     // Query snapshot contains zero or more DocumentSnapshots. Use forEach on the querySnapshot to iterate through the DocumentSnapshots
     // Call .data on a Document snapshot to get that docs data.
     return this.afs.collection<[]>('resourceTypes').ref.limit(1)
   }
   
}
