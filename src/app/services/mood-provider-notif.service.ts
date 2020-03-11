import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

export interface EmotionNotif {
  id?: string;
  username: string;
  userID: string;
  emotionEntered: string;
  viewed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MoodProviderNotifService {

  constructor(public afs: AngularFirestore) { }


  addEmotionNotif(emotionNotif) {
    return this.afs.firestore.collection('userEmotionNotifs').add(emotionNotif);
  }

}
