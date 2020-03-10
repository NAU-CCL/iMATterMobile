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
  private learningModNotif: boolean;
  private surveyNotif: boolean;

  constructor(public afs: AngularFirestore, private storage: Storage, private fcm: FcmService) {

  }

  ngOnInit() {
    this.storage.get('userCode').then((val) => {
      if (val) {
        this.afs.firestore.collection('users').where('code', '==', val)
            .get().then(snapshot => {
          snapshot.forEach(doc => {
            //chat notification
            if (doc.get('chatNotif') === false) {
              this.chatNotif = false;
            } else {
              this.chatNotif = true;
            }
            //learning module notification
            if (doc.get('learningModNotif') === false) {
              this.learningModNotif = false;
            } else {
              this.learningModNotif = true;
            }
            //survey notification
            if (doc.get('surveyNotif') === false) {
              this.surveyNotif = false;
            } else {
              this.surveyNotif = true;
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

  setLearningModuleNotification(notifSetting) {
    this.storage.get('userCode').then((val) => {
      if (val) {
        this.afs.firestore.collection('users').where('code', '==', val)
            .get().then(snapshot => {
              snapshot.forEach(doc => {
                if (notifSetting === false) {
                  this.afs.firestore.collection('users')
                      .doc(val).update({learningModNotif: false});
                } else {
                  this.afs.firestore.collection('users')
                      .doc(val).update({learningModNotif: true});
                  this.notificationSetup(val);
                }
              });
            });
      }
    });
  }

  setSurveyNotification(notifSetting) {
    this.storage.get('userCode').then((val) => {
      if (val) {
        this.afs.firestore.collection('users').where('code', '==', val)
            .get().then(snapshot => {
              snapshot.forEach(doc => {
                if (notifSetting === false) {
                  this.afs.firestore.collection('users')
                      .doc(val).update({surveyNotif: false});
                } else {
                  this.afs.firestore.collection('users')
                      .doc(val).update({surveyNotif: true});
                  this.notificationSetup(val);
                }
              });
            });
      }
    });
  }
}
