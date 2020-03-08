import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentReference } from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage';
import * as firebase from 'firebase/app';

export interface Cohort {
  id?: string;
  name: string;
}

export interface Chat {
  id?: string;
  cohort: string;
  username: string;
  userID: string;
  timestamp: any;
  message: string;
  profilePic: any;
  type: any;
  visibility: boolean;
}

@Injectable({
  providedIn: 'root'
})

export class ChatService {

  private cohorts: Observable<Cohort[]>;
  private cohortCollection: AngularFirestoreCollection<Cohort>;

  private chats: Observable<Chat[]>;
  private chatCollection: AngularFirestoreCollection<Chat>;


  constructor(private afs: AngularFirestore, private storage: Storage) {
    this.cohortCollection = this.afs.collection<Cohort>('cohorts');

    this.cohorts = this.cohortCollection.snapshotChanges().pipe(
        map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data();
            data.id = a.payload.doc.id;
            return data;
          });
        })
    );
  }

  getChats(cohortID) {
    this.getChatCollection(cohortID);
    return this.chats;
  }

  getChatCollection(cohortID) {
    this.iterateChats(cohortID);

    this.chatCollection = this.afs.collection('chats',
        reference => reference.where('cohort', '==', cohortID).orderBy('timestamp'));

    this.chats = this.chatCollection.snapshotChanges().pipe(
        map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data();
            data.id = a.payload.doc.id;
            return data;
          });
        })
    );
  }

  async addChat(chat: Chat) {
    this.afs.collection('chats').add({
      username: chat.username,
      message: chat.message,
      userID: chat.userID,
      cohort: chat.cohort,
      timestamp: chat.timestamp,
      profilePic: chat.profilePic,
      type: chat.type,
      visibility: chat.visibility
    });
  }


  updateChatVisibility(docID, bool) {
    if (bool === false) {
      return this.afs.firestore.collection('chats')
          .doc(docID).update({visibility: false});
    } else {
      return this.afs.firestore.collection('chats')
          .doc(docID).update({visibility: true});
    }
  }

  iterateChats(cohortID) {
    firebase.firestore().collection('mobileSettings').doc('chatHours').get().then((result) => {
      // get admin set time for chats to last
      let setHours = Number(result.get('hours'));
      console.log('setHours', setHours);
      // convert to ms
      setHours = setHours * 60 * 60 * 1000;
      console.log('setHours', setHours);
      // get todays date
      const now = new Date();
      console.log('now', now);

      // go into all chats
      const ref = firebase.firestore().collection('chats').where('cohort', '==', cohortID);
      ref.get().then((res) => {
        res.forEach(doc => {
          const timestamp = new Date(doc.get('timestamp').toDate());
          console.log('timestamp', timestamp);
          const difference = now.getTime() - timestamp.getTime();
          console.log('difference', difference);
          console.log('setHours', setHours);

          if (difference >= setHours) {
            this.updateChatVisibility(doc.id, false);
          } else {
            this.updateChatVisibility(doc.id, true);
          }
        });
      });

    });
  }

}
