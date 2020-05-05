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

  public chatNotif: boolean;
  public learningModNotif: boolean;
  public surveyNotif: boolean;
  public infoDeskNotif: boolean;
  public notificationTime: number;
  public clock;
  public eventNotificationTime;
  constructor(public afs: AngularFirestore, private storage: Storage, private fcm: FcmService) {


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

            //infoDesk notification
            if (doc.get('infoDeskNotif') === false) {
              this.infoDeskNotif = false;
            } else {
              this.infoDeskNotif = true;
            }
          });
        });
      }
    });

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

  setInfoDeskNotification(notifSetting) {
    this.storage.get('userCode').then((val) => {
      if (val) {
        this.afs.firestore.collection('users').where('code', '==', val)
            .get().then(snapshot => {
          snapshot.forEach(doc => {
            if (notifSetting === false) {
              this.afs.firestore.collection('users')
                  .doc(val).update({infoDeskNotif: false});
            } else {
              this.afs.firestore.collection('users')
                  .doc(val).update({infoDeskNotif: true});
              this.notificationSetup(val);
            }
          });
        });
      }
    });
  }
  setCalendarEventNotificationTime(eventNotificationTime){
	  this.storage.get('userCode').then((val) => {
      if (val) {
        this.afs.firestore.collection('users').where('code', '==', val)
            .get().then(snapshot => {
          snapshot.forEach(doc => {
              this.afs.firestore.collection('users')
                  .doc(val).update({notificationTime: eventNotificationTime});
            
            
          });
        });
      }
    });
}
setClockType(clock){
	  this.storage.get('userCode').then((val) => {
      if (val) {
        this.afs.firestore.collection('users').where('code', '==', val)
            .get().then(snapshot => {
          snapshot.forEach(doc => {
              this.afs.firestore.collection('users')
                  .doc(val).update({clockType: clock});
            
            
          });
        });
      }
    });
}

}
