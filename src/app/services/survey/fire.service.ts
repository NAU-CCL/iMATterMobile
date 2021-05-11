import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/firestore'
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

// declares Survey object interface, making sure every Survey object has these fields
export interface Survey {
  id?: string;
  title: string;
  surveyLink: string;
  type: string;
  daysTillRelease: string;
  daysBeforeDueDate: string;
  daysTillExpire: number;
  daysInactive: number;
  emotionChosen: string;
  pointsWorth: number;
  userVisibility: string[];
  surveyDescription: string;
}

@Injectable({
  providedIn: 'root'
})

export class FireService {
  private surveys: Observable<Survey[]>;
  private surveyCollection: AngularFirestoreCollection<Survey>;
  
  constructor(private angularfs: AngularFirestore) {}

   getSurveyCollection()  {
     // gets the collection of surveys
    this.surveyCollection = this.angularfs.collection<Survey>('surveys');

    //  looks for changes and updates, also grabs the data
    this.surveys = this.surveyCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
   }

   // gets all of the surveys in the survey collection
   getSurveys(): Observable<Survey[]> {
     this.getSurveyCollection();
     return this.surveys;
  }

  // gets an individual survey with id provided
  getSurvey(id: string){
    return this.surveyCollection.doc<Survey>(id).valueChanges().pipe(
      take(1),
      map(survey => {
        survey.id = id;
        return survey  
      })
    );
  }
  
  // updates user's answeredSurveys list
  updateAnsweredSurveys(userID: string, answered: any[]){
    return this.angularfs.firestore.collection('users')
    .doc(userID).update({answeredSurveys: answered});
  }

  // updates user's recentNotifications list
  updateRecentNot(userID: string, recent: any[]){
    return this.angularfs.firestore.collection('users')
    .doc(userID).update({recentNotifications: recent});
  }
}
