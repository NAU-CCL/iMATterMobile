import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  private chatNotif: boolean;

  constructor(public afs: AngularFirestore, private storage: Storage,) {
    this.chatNotif = true;
  }

  ngOnInit() {

  }


  setChatNotification(notifSetting) {
    this.storage.get('userCode').then((val) => {
      if (val) {
        this.afs.firestore.collection('users').where('code', '==', val)
            .get().then(snapshot => {
              snapshot.forEach(doc => {
                if (notifSetting === false) {
                  this.afs.firestore.collection('users')
                      .doc(val).update({chatNotif: false, token: ''});
                } else {
                  this.afs.firestore.collection('users')
                      .doc(val).update({chatNotif: true});
                }
              });
            });
      }
    });
  }
}
