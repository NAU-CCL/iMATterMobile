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
  endRehabDate: string;
  location: number;
  weeksPregnant: any;
  daysPregnant: any;
  totalDaysPregnant: any;
  cohort: any;
  securityQ: string;
  securityA: string;
  bio: string;
  currentEmotion: string;
  profilePic: any;
  joined: any;
  daysAUser: any;
  points: number;
  chatNotif: boolean;
  learningModNotif: boolean;
  surveyNotif: boolean;
  infoDeskNotif: boolean;
  token: any;
  recentNotifications: any[];
  answeredSurveys: any[];
  joinedChallenges: any[];
  completedChallenges: any[];
  codeEntered: boolean;
  dailyQuote: string;
  availableSurveys: string[];
  autoLogin: boolean;
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
  providerType: string;
}

export interface SecurityQ {
  id?: string;
  securityQ: string;
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
          return { id, ...data };
        });
      })
    );
  }


  // tslint:disable-next-line:max-line-length
  signupUser(user: User): Promise<any> {
    return this.userCollection.doc(user.code).set(user);
  }


}
