import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { Storage } from '@ionic/storage';
import { FcmService } from "../../../services/pushNotifications/fcm.service";
import { ProfileService } from "../../../services/user/profile.service";

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
  public autoLogin;

  constructor(public afs: AngularFirestore,
              private storage: Storage,
              private fcm: FcmService,
              private profileService: ProfileService) {

                //this.profileService.updateAutoLogin( autoLogInUser, this.userProfileID );


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

            // Auto log in setting
            if (doc.get('autoLogin') === false) {
              this.autoLogin = false;
            } else {
              this.autoLogin = true;
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

// Update the users auto login preference
setAutoLogin()
{
  //console.log(`USER AUTO LOG PREFERNCE WAS CHANGED TO ${this.autoLogin}`);

  this.storage.get('userCode').then((userID) => {
    this.profileService.updateAutoLogin( this.autoLogin, userID );
  })
}

}
