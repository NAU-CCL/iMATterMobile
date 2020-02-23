import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentReference } from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage';
import * as firebase from 'firebase/app';
//import FieldValue = firebase.firestore.FieldValue;


export interface Analytics
{
  id?: string,
  page: string,
  userID: string,
  timestamp: any,
  sessionID: string
}


export interface Sessions
{
  id?: string,
  userID: string,
  LogOutTime: any,
  LoginTime: any,
  numOfClickChat: number,
  numOfClickCalendar: number,
  numOfClickLModule: number,
  numOfClickInfo: number,
  numOfClickSurvey: number,
  numOfClickProfile: number,
  numOfClickMore: number
}



export interface UniqueSessions
{
  id?: string,
  page: string,
  userID: string,
  timestamp: any,
  sessionID: string
//  sessionID: string
}

@Injectable({
  providedIn: 'root'
})

export class AnalyticsService {

  private analytics: Observable<Analytics[]>;
  private analyticsCollection: AngularFirestoreCollection<Analytics>;
  private analytic: Analytics;

  private sessions: Observable<Sessions[]>;
  private sessionCollection: AngularFirestoreCollection<Sessions>;
  private session: Sessions;
  public idReference :string;


  private uniqueSessions: Observable<UniqueSessions[]>;
  private UniqueSessionsCollection: AngularFirestoreCollection<UniqueSessions>;




  constructor(private afs: AngularFirestore) {


    this.sessionCollection = this.afs.collection<Sessions>('analyticsSessions');
    this.sessions = this.sessionCollection.snapshotChanges().pipe(
        map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return {id, ...data};
          });
        })
    );

    this.analyticsCollection = this.afs.collection<Analytics>('analyticsStorage');
    this.analytics = this.analyticsCollection.snapshotChanges().pipe(
        map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return {id, ...data};
          });
        })
    );
  }


  getAllSessions (): Observable<Sessions[]>
  {
    return this.sessions;
  }


  getAllUserPages(): Observable<Analytics[]>
  {
    return this.analytics;
  }


  getSession(id: string): Observable<Sessions>{
    return this.sessionCollection.doc<Sessions>(id).valueChanges().pipe(
      take(1),
      map(session =>{
        session.id = id;
        return session;
      })
    );
  }


  getPageViews(sessionID)
  {
    this.getAnalyticsStorageCollection(sessionID);
    return this.analytics;
  }



  getUniqueUserStorageCollection(userID)
  {
    this.UniqueSessionsCollection = this.afs.collection('analyticsStorage',
      ref => ref.where("userID", '==', userID).orderBy('timestamp'));
    this.uniqueSessions = this.UniqueSessionsCollection.snapshotChanges().pipe(
            map(actions => {
              return actions.map(a => {
                const data = a.payload.doc.data();
                const id = a.payload.doc.id;
                return {id, ...data};
              });
            })
        );
  }

  getUniqueUserStorage(userID) {
    this.getUniqueUserStorageCollection(userID);
    return this.uniqueSessions;
  }

  getAnalyticsStorageCollection(sessionID)
  {
    this.analyticsCollection = this.afs.collection('analyticsStorage',
      ref => ref.where("analyticsStorage", '==', sessionID).orderBy('timestamp'));
    this.analytics = this.analyticsCollection.snapshotChanges().pipe(
            map(actions => {
              return actions.map(a => {
                const data = a.payload.doc.data();
                const id = a.payload.doc.id;
                return {id, ...data};
              });
            })
        );
  }

  async addView(analytic: Analytics) {
  this.afs.collection('analyticsStorage').add({
    page: analytic.page,
    userID: analytic.userID,
    sessionID: this.idReference,
    timestamp: analytic.timestamp

  });
}

  async addSession(session: Sessions ){
    this.afs.collection('analyticsSessions').add({
      userID: session.userID,
      LogOutTime: session.LogOutTime,
      LoginTime: session.LoginTime,
      numOfClickChat: session.numOfClickChat,
      numOfClickCalendar: session.numOfClickCalendar,
      numOfClickLModule: session.numOfClickLModule,
      numOfClickInfo: session.numOfClickInfo,
      numOfClickSurvey: session.numOfClickSurvey,
      numOfClickProfile: session.numOfClickProfile,
      numOfClickMore: session.numOfClickMore
  ,
  })
    .then ( ref => {
      this.idReference = ref.id;
      console.log(ref.id);

    });
  }

  async updateLogOut (session: Sessions){
    this.sessionCollection.doc(this.idReference).update({LogOutTime: firebase.firestore.FieldValue.serverTimestamp()});
  }


  updateProfileClicks (session: Sessions){
    this.sessionCollection.doc(this.idReference).update({numOfClickProfile:  firebase.firestore.FieldValue.increment(1)});
  }

  updateChatClicks (session: Sessions){
    this.sessionCollection.doc(this.idReference).update({numOfClickChat:  firebase.firestore.FieldValue.increment(1)});
  }

  updateCalendarClicks (session: Sessions){
    this.sessionCollection.doc(this.idReference).update({numOfClickCalendar:  firebase.firestore.FieldValue.increment(1)});
  }

  updateMoreClicks (session: Sessions){
    this.sessionCollection.doc(this.idReference).update({numOfClickMore:  firebase.firestore.FieldValue.increment(1)});
  }

  updateLModuleClicks (session: Sessions){
    this.sessionCollection.doc(this.idReference).update({numOfClickLModule:  firebase.firestore.FieldValue.increment(1)});
  }

  updateInfoClicks (session: Sessions){
    this.sessionCollection.doc(this.idReference).update({numOfClickInfo:  firebase.firestore.FieldValue.increment(1)});
  }



}
