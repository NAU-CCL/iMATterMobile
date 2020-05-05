import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentReference } from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';


export interface Submission {
  id?: string;
  title: string;
  description: string;
  username: string;
  userID: string;
  timestamp: any;
  type: any;
  operatingSys: string;
  version: string;
  viewed: false;
}

export interface LocationSuggestion {
  id?: string;
  name: string;
  address: string;
  reason: string;
  username: string;
  userID: string;
  timestamp: any;
  type: any;
  viewed: false;
}

@Injectable({
  providedIn: 'root'
})

export class UserSubmissionsService {
  private submissions: Observable<Submission[]>;
  private submissionCollection: AngularFirestoreCollection<Submission>;

  private locationSuggestions: Observable<LocationSuggestion[]>;
  private locationSuggestionsCollection: AngularFirestoreCollection<LocationSuggestion>;

  constructor(private afs: AngularFirestore) {
    this.submissionCollection = this.afs.collection<Submission>('submissions', ref => ref.orderBy('timestamp', 'desc'));

    this.submissions = this.submissionCollection.snapshotChanges().pipe(
        map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data();
            data.id = a.payload.doc.id;
            return data;
          });
        })
    );

    this.locationSuggestionsCollection = this.afs.collection<LocationSuggestion>('locationSuggestions', ref => ref.orderBy('timestamp', 'desc'));

    this.locationSuggestions = this.locationSuggestionsCollection.snapshotChanges().pipe(
        map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data();
            data.id = a.payload.doc.id;
            return data;
          });
        })
    );
  }

  addSubmission(submission: Submission): Promise<DocumentReference> {
    return this.submissionCollection.add(submission);
  }

  addLocationSuggestion(locationSuggestion: LocationSuggestion): Promise<DocumentReference> {
    return this.locationSuggestionsCollection.add(locationSuggestion);
  }

}


