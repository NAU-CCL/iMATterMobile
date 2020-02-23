import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentReference } from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

export interface User {
  id?: string;
  code: string;
  username: string;
  email: string;
  password: string;
  dueDate: string;
  location: number;
  weeksPregnant: any;
  cohort: any;
  securityQ: string;
  securityA: string;
  bio: string;
  currentEmotion: string;
  profilePic: any;
  joined: any;
  daysAUser: any;
  token: any;
}

export interface Provider {
  id?: string;
  code: string;
  username: string;
  nameFirst: string;
  nameLast: string;
  email: string;
  password: string;
  profilePic: any;
  dob: string;
  bio: string;
  type: string;
}

@Injectable({
  providedIn: 'root'
})

export class AuthServiceProvider {

  private users: Observable<User[]>;
  private userCollection: AngularFirestoreCollection<User>;

  constructor(private afs: AngularFirestore) {
    this.userCollection = this.afs.collection<User>('users');
    this.users = this.userCollection.snapshotChanges().pipe(
        map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return {id, ...data};
          });
        })
    );
  }


  // tslint:disable-next-line:max-line-length
  signupUser(user: User): Promise<any> {
    return this.userCollection.doc(user.code).set({
      code: user.code,
      email: user.email,
      securityQ: user.securityQ,
      securityA: user.securityA,
      password: user.password,
      username: user.username,
      dueDate: user.dueDate,
      location: user.location,
      bio: user.bio,
      cohort: user.cohort,
      profilePic: user.profilePic,
      joined: user.joined,
      daysAUser: user.daysAUser,
    token: user.token});
  }


  resetPassword(email: string): Promise<void> {
    return firebase.auth().sendPasswordResetEmail(email);
  }


}
