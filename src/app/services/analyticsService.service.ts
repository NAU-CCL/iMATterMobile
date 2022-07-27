import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentReference } from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage';
import * as firebase from 'firebase/app';
import { ProfileService } from './user/profile.service';
// import FieldValue = firebase.firestore.FieldValue;


export interface Analytics {
  id?: string;
  page: string;
  userID: string;
  timestamp: any;
  sessionID: string;
}


export interface Sessions {
  id?: string;
  userID: string;
  LogOutTime: any;
  LoginTime: any;
  numOfClickChat: number;
  numOfClickCalendar: number;
  numOfClickLModule: number;
  numOfClickInfo: number;
  numOfClickSurvey: number;
  numOfClickProfile: number;
  numOfClickMore: number;
  numOfClickHome: number;
}



export interface UniqueSessions {
  id?: string;
  page: string;
  userID: string;
  timestamp: any;
  sessionID: string;
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
  public idReference: string;


  private uniqueSessions: Observable<UniqueSessions[]>;
  private UniqueSessionsCollection: AngularFirestoreCollection<UniqueSessions>;





  constructor(private afs: AngularFirestore,
              private profileService: ProfileService) {


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


  getAllSessions(): Observable<Sessions[]> {
    return this.sessions;
  }


  getAllUserPages(): Observable<Analytics[]> {
    return this.analytics;
  }


  getSession(id: string): Observable<Sessions> {
    return this.sessionCollection.doc<Sessions>(id).valueChanges().pipe(
      take(1),
      map(session => {
        session.id = id;
        return session;
      })
    );
  }


  getPageViews(sessionID) {
    this.getAnalyticsStorageCollection(sessionID);
    return this.analytics;
  }



  getUniqueUserStorageCollection(userID) {
    this.UniqueSessionsCollection = this.afs.collection('analyticsStorage',
      ref => ref.where('userID', '==', userID).orderBy('timestamp'));
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

  getAnalyticsStorageCollection(sessionID) {
    this.analyticsCollection = this.afs.collection('analyticsStorage',
      ref => ref.where('analyticsStorage', '==', sessionID).orderBy('timestamp'));
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


  async addSessionOnAppEnter( ) {

    console.log(`Adding new user session`);
    let userID: string  = '';

    // Get the user code and then add a new session to the analyticsSessions collection using the user code.
    this.profileService.getCurrentUserCode().then((userDocSnapObs) => {
      userDocSnapObs.subscribe( (userCode) => {
          userID = userCode.data().code;
          console.log(`User code is in analytics service: ${userID}`);

          let newSessionObj = {
            userID: userID,
            LogOutTime: null,
            LoginTime: new Date(),
            numOfClickChat: 0,
            numOfClickCalendar: 0,
            numOfClickLModule: 0,
            numOfClickInfo: 0,
            numOfClickSurvey: 0,
            numOfClickProfile: 0,
            numOfClickMore: 0,
            numOfClickHome: 0
        
        };
          this.afs.collection('analyticsSessions').add(newSessionObj)
          .then ( ref => {
            this.idReference = ref.id;
            console.log(`User session object id is ${ref.id}`);
            console.log(`Creating New User session object is  ${JSON.stringify(newSessionObj)}`);
          });
      })
    });
  }

  async endSessionOnAppExit() {
    console.log(`Ending session, app lost focus.`);
    this.sessionCollection.doc(this.idReference).update({LogOutTime: firebase.firestore.FieldValue.serverTimestamp()});
  }

  updateClicks( pageName )
  {
    console.log(`Updating ${pageName} clicks, session object ref is ${this.idReference}`)

      if( this.idReference )
      {

        this.sessionCollection.doc(this.idReference).get().subscribe( (docSnap) => {
            let docData = docSnap.data();
  
            // If property exists on document, increment it else, add the field with value of 1 for single click.
            if( docData.hasOwnProperty(pageName) )
            {
              docSnap.ref.update({[pageName]:  firebase.firestore.FieldValue.increment(1)}).then( ()=>{
                this.sessionCollection.doc(this.idReference).get().subscribe( (docSnap)=> {
                  console.log(`The incremeneted session object is now ${JSON.stringify( docSnap.data() )}`);
                })
              });
            }
            else
            {
              docSnap.ref.update({[pageName]:  1}).then( ()=>{
                this.sessionCollection.doc(this.idReference).get().subscribe( (docSnap)=> {
                  console.log(`The incremeneted session object is now ${JSON.stringify( docSnap.data() )}`);
                })
              });
            }
          })
      }
      else
      {
        console.log(`SESSION ID REFERENCE WAS NULL!`);
      }

   
  }

  


}
