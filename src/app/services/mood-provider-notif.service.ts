import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/compat/firestore';

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
