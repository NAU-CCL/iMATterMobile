import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/compat/firestore';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

export interface EmotionNotif {
  id?: string;
  username: string;
  userID: string;
  emotionEntered: string;
  viewed: boolean;
  timestamp: any;
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
