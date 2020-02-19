import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentReference } from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage';

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

    this.chatCollection = this.afs.collection('chats',
            ref => ref.where('cohort', '==', cohortID).orderBy('timestamp'));

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

  deleteChat(id: string): Promise<void> {
    return this.chatCollection.doc(id).delete();
  }

  async addChat(chat: Chat) {
    this.afs.collection('chats').add({
      username: chat.username,
      message: chat.message,
      userID: chat.userID,
      cohort: chat.cohort,
      timestamp: chat.timestamp,
      profilePic: chat.profilePic,
      type: chat.type
    });
  }
}
