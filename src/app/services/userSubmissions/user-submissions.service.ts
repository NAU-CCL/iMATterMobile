import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentReference } from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface Report {
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
  private reports: Observable<Report[]>;
  private reportCollection: AngularFirestoreCollection<Report>;

  private locationSuggestions: Observable<LocationSuggestion[]>;
  private locationSuggestionsCollection: AngularFirestoreCollection<LocationSuggestion>;

  constructor(private afs: AngularFirestore) {
    this.reportCollection = this.afs.collection<Report>('reports', ref => ref.orderBy('timestamp', 'desc'));

    this.reports = this.reportCollection.snapshotChanges().pipe(
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

  addReport(report: Report): Promise<DocumentReference> {
    return this.reportCollection.add(report);
  }

  addLocationSuggestion(locationSuggestion: LocationSuggestion): Promise<DocumentReference> {
    return this.locationSuggestionsCollection.add(locationSuggestion);
  }

}


