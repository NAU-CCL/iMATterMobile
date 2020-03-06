import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/firestore'
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

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
}

export interface User {
  id?: string;
  answered: [];
}

@Injectable({
  providedIn: 'root'
})

export class FireService {
  private surveys: Observable<Survey[]>;
  private surveyCollection: AngularFirestoreCollection<Survey>;
  
  constructor(private angularfs: AngularFirestore) {
    this.surveyCollection = this.angularfs.collection<Survey>('surveys');
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

   getSurveys(){
    return this.surveys;
  }

  getSurvey(id: string){
    return this.surveyCollection.doc<Survey>(id).valueChanges().pipe(
      take(1),
      map(survey => {
        survey.id = id;
        return survey  
      })
    );
  }
  
  addSurvey(survey: Survey): Promise<DocumentReference>{
    return this.surveyCollection.add(survey);
  }

  updateSurvey(survey: Survey): Promise<void>{
    return this.surveyCollection.doc(survey.id).update({ 
      title: survey.title,
      surveyLink: survey.surveyLink,
      type: survey.type,
      daysTillRelease: survey.daysTillRelease,
      daysBeforeDueDate: survey.daysBeforeDueDate,
      daysTillExpire: survey.daysTillExpire,
      daysInactive: survey.daysInactive,
      emotionChosen: survey.emotionChosen });
  }

  deleteSurvey(id: string): Promise<void>{
    return this.surveyCollection.doc(id).delete();
  }

  getTime(timeString: string){

    var dateFormat = timeString.split("-");
    var dateSplit = dateFormat[2].split(":");
    var minute = dateSplit[1];
    var year = dateFormat[0];
    var month = dateFormat[1];

    var secondSplit = dateSplit[0].split("T");
    var day = secondSplit[0];
    var hour = secondSplit[1];
    
    var dateChose = year + " " + month + " " + day + " " + hour + " " + minute;
    
    return dateChose;
  }
}