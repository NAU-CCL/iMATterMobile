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
}

@Injectable({
  providedIn: 'root'
})
export class UserSubmissionsService {
  private submissions: Observable<Submission[]>;
  private submissionCollection: AngularFirestoreCollection<Submission>;

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

  }

  addSubmission(submission: Submission): Promise<DocumentReference> {
    return this.submissionCollection.add(submission);
  }
}


