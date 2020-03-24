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
  count: number;
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

  getChats(cohortID): Observable<Chat[]> {
    this.getChatCollection(cohortID);
    // this.iterateChats(cohortID);
    return this.chats;
  }

  getChatCollection(cohortID) {
    // this.iterateChats(cohortID);

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
      visibility: chat.visibility,
      count: chat.count
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


  updateChatNumberCounter(docID, num) {
    return this.afs.firestore.collection('chats')
          .doc(docID).update({count: num});
  }

  /* This function iterates through all chats in a cohort to decide if they are visible to the user or not */
  async iterateChats(cohortID) {
    console.log('iterateChats called');
    // get what the admin has set to determine user visibility of chats
    firebase.firestore().collection('mobileSettings').doc('chatroomSettings').get().then((result) => {
      const lifeType = result.get('lifeType');

      // if chat visibility is based on number of hours the chat has existed
      if (lifeType === 'hours' ) {
        // get admin set time for chats to last
        let setHours = result.get('hours');
        // convert to ms
        setHours = setHours * 60 * 60 * 1000;
        // get todays date
        const now = new Date();
        console.log('now', now);

        // go into all chats
        const ref = firebase.firestore().collection('chats').where('cohort', '==', cohortID);
        ref.get().then((res) => {
          res.forEach(doc => {
            const timestamp = new Date(doc.get('timestamp').toDate());
            // check difference between the time the chat was sent and now
            const difference = now.getTime() - timestamp.getTime();

            // if this difference is greater than set hours, set visibility to false. Otherwise, true
            if (difference >= setHours) {
              this.updateChatVisibility(doc.id, false);
            } else {
              // this.updateChatVisibility(doc.id, true);
            }
          });
        });
        // check if the type is based on number of chats in the room
      } else if (lifeType === 'number') {
        // get the number admin has set
        const numChatsVis = result.get('numberOfChats');

        let chatsObservable = this.getChats(cohortID).subscribe(resul => {
          console.log(resul.length);
        });

        /*
        let numberOfCurrentChats = 0;
        let numberOfCurrentAutoChats = 0;
        // time order is oldest to newest
        const ref = firebase.firestore().collection('chats').where('cohort', '==', cohortID).orderBy('timestamp');
        ref.get().then((res) => {
          res.forEach(doc => {
            // for each doc in the cohort chat room, if it is a user sent, iterate
            if (doc.get('type') === 'user') {
              // count the number of non-auto chats
              numberOfCurrentChats += 1;
              // assign a new number to each chat
              this.updateChatNumberCounter(doc.id, numberOfCurrentChats);
            } else if (doc.get('type') === 'emotion' || doc.get('type') === 'auto') {
              // count the number of auto chats
              numberOfCurrentAutoChats += 1;
              // assign a new number to each chat
              this.updateChatNumberCounter(doc.id, numberOfCurrentAutoChats);
            }
          });
          // iterate chats again - after setting count
          res.forEach(doc => {
            if (doc.get('type') === 'user') {
              // since the chats are grabbed oldest to newest - we want all chats that are greater than the difference
              // of current chats - the number of chats allowed
              if (doc.get('count') > (numberOfCurrentChats - numChatsVis)) {
                this.updateChatVisibility(doc.id, true);
              } else {
                this.updateChatVisibility(doc.id, false);
              }
            } else if (doc.get('type') === 'emotion' || doc.get('type') === 'auto') {
              if (doc.get('count') > (numberOfCurrentAutoChats - 10)) {
                this.updateChatVisibility(doc.id, true);
              } else {
                this.updateChatVisibility(doc.id, false);
              }
            }
          });
        });*/

      }
    });
  }
}
