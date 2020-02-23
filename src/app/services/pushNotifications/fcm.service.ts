import { Injectable } from '@angular/core';
import { Firebase } from '@ionic-native/firebase/ngx';
import { AngularFirestore } from '@angular/fire/firestore';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class FcmService {

  constructor(private firebase: Firebase,
              private angularFirestore: AngularFirestore,
              private platform: Platform) {
  }


  async getToken(userID) {
    let token;
    if (this.platform.is('android')) {
      console.log('android in got token');
      token = await this.firebase.getToken();
    }
    console.log('right before save');
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

  onNotifications() {
    return this.firebase.onNotificationOpen();
  }


}
