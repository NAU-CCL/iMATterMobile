import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { FcmService } from "../../../services/pushNotifications/fcm.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  private chatNotif: boolean;

  constructor(public afs: AngularFirestore, private storage: Storage, private fcm: FcmService) {

  }

  ngOnInit() {
    this.storage.get('userCode').then((val) => {
      if (val) {
        this.afs.firestore.collection('users').where('code', '==', val)
            .get().then(snapshot => {
          snapshot.forEach(doc => {
            if (doc.get('chatNotif') === false) {
              this.chatNotif = false;
            } else {
              this.chatNotif = true;
            }
          });
        });
      }
    });
  }


  setChatNotification(notifSetting) {
    this.storage.get('userCode').then((val) => {
      if (val) {
        this.afs.firestore.collection('users').where('code', '==', val)
            .get().then(snapshot => {
              snapshot.forEach(doc => {
                if (notifSetting === false) {
                  this.afs.firestore.collection('users')
                      .doc(val).update({chatNotif: false});
                } else {
                  this.afs.firestore.collection('users')
                      .doc(val).update({chatNotif: true});
                  this.notificationSetup(val);
                }
              });
            });
      }
    });
  }

  private notificationSetup(userID) {
    console.log(userID);
    this.fcm.getToken(userID);
  }
}
