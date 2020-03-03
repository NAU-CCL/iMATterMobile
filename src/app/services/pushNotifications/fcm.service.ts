import { Injectable } from '@angular/core';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { AngularFirestore } from '@angular/fire/firestore';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class FcmService {

  constructor(private firebase: FirebaseX,
              private angularFirestore: AngularFirestore,
              private platform: Platform) { }

  async getToken(userID) {
    let token;
    if (this.platform.is('android')) {
      console.log('android in got token');
      token = await this.firebase.getToken();
    } else {
      token = await this.firebase.getToken();
    }

    this.saveToken(token, userID);
  }

  private saveToken(token, userID) {
    if (!token) return;
    const devicesDatabaseReference = this.angularFirestore.collection('users').doc(userID);
    const data = {
      token,
      userId: userID,
    };
    return devicesDatabaseReference.set({token: token}, { merge: true });
  }

  /*
  onNotifications() {
    return this.firebase.onNotificationOpen();
  }*/


}
