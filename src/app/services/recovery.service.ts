import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentReference } from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
 
 
 /**
 * This code written with the help of this tutorial:
 * https://devdactic.com/ionic-4-firebase-angularfire-2/
 * Used for storing and accessing learning module info in the database
 */
 
export interface Recovery_email {
  id?: string,
  email: string,
  code: string
}
 
@Injectable({
  providedIn: 'root'
})
export class recovery_emailService {
  private recovery_email: Observable<Recovery_email[]>;
  private recovery_emailCollection: AngularFirestoreCollection<Recovery_email>;
 
  constructor(private afs: AngularFirestore) {
    this.recovery_emailCollection = this.afs.collection<Recovery_email>('recovery_email');
    this.recovery_email = this.recovery_emailCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
  }
  
  async addRecovery(recovery_email: Recovery_email) {
    this.afs.collection('recovery_email').add({
      email: recovery_email.email,
      code: recovery_email.code
    });
  }
 
  
}