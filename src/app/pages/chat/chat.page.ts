import {Component, OnInit, ViewChild, NgZone} from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { ChatService, Cohort, Chat } from '../../services/chat/chat-service.service';
import {Observable} from 'rxjs';
import * as firebase from 'firebase/app';
import {AngularFirestore} from '@angular/fire/firestore';
import {IonContent} from '@ionic/angular';
import {
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed } from '@capacitor/core';

const { PushNotifications } = Plugins;

@Component({
  selector: 'app-tab2',
  templateUrl: 'chat.page.html',
  styleUrls: ['chat.page.scss']
})
export class ChatPage implements OnInit {

  @ViewChild('content', {static: true}) content: IonContent;


  cohort: Cohort = {
    name: ''
  };

  chat: Chat = {
  cohort: '',
  username: '',
  userID: '',
  timestamp: '',
  message: '',
  profilePic: '',
  type: ''
};

  private cohortChat: string;
  private chats: Observable<any>;
  private hasEntered: boolean;

  constructor(public _zone: NgZone, private router: Router, private storage: Storage, private chatService: ChatService, private afs: AngularFirestore) {


    this.storage.get('cohort').then((val) => {
      if (val) {
        this.router.navigate(['/tabs/chat/', val]);
        this.cohortChat = val;
        this.chats = this.chatService.getChats(this.cohortChat);
      }
    });
  }

  ngOnInit() {
    this.storage.get('authenticated').then((val) => {
      if (val === 'false') {
        this.router.navigate(['/login/']);
      }
    });

    console.log('Initializing HomePage');

    // Register with Apple / Google to receive push via APNS/FCM
    PushNotifications.register();

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration',
        (token: PushNotificationToken) => {
          alert('Push registration success, token: ' + token.value);
        }
    );

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError',
        (error: any) => {
          alert('Error on registration: ' + JSON.stringify(error));
        }
    );

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived',
        (notification: PushNotification) => {
          alert('Push received: ' + JSON.stringify(notification));
        }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed',
        (notification: PushNotificationActionPerformed) => {
          alert('Push action performed: ' + JSON.stringify(notification));
        }
    );

    this.getCohort();
    this.scrollToBottom();
  }

  ionViewDidEnter() {
    this.chat.cohort = this.cohortChat;
    this.storage.get('userCode').then((val) => {
      if (val) {
        const ref = this.afs.firestore.collection('users').where('code', '==', val);
        ref.get().then((result) => {
          result.forEach(doc => {

            this.chat.userID = val;
            this.chat.username = doc.get('username');
            this.chat.profilePic = doc.get('profilePic');
            this.chat.timestamp = firebase.firestore.FieldValue.serverTimestamp();
            this.chat.message = this.chat.username + ' has entered the chat';
            this.chat.type = 'auto';

            this.chatService.addChat(this.chat).then(() => {
              this.chat.message = '';
              this._zone.run(() => {
                setTimeout(() => {
                  this.content.scrollToBottom(300);
                });
              });
            }, err => {

            });
          });
        });
      }
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.content.scrollToBottom) {
        this.content.scrollToBottom(400);
      }
    }, 500);
  }

  getCohort() {
    this.storage.get('cohort').then((val) => {
      if (val) {
        const ref = this.afs.firestore.collection('cohorts').where('name', '==', val);
        ref.get().then((result) => {
          result.forEach(doc => {

            this.cohort.name = doc.get('name');
          });
        });
      }
    });

  }

  addChat() {
    this.chat.cohort = this.cohortChat;
    this.storage.get('userCode').then((val) => {
      if (val) {
        const ref = this.afs.firestore.collection('users').where('code', '==', val);
        ref.get().then((result) => {
          result.forEach(doc => {

            this.chat.userID = val;
            this.chat.username = doc.get('username');
            this.chat.profilePic = doc.get('profilePic');
            this.chat.timestamp = firebase.firestore.FieldValue.serverTimestamp();
            this.chat.type = 'user';

            this.chatService.addChat(this.chat).then(() => {
              this.chat.message = '';
              this._zone.run(() => {
                setTimeout(() => {
                  this.content.scrollToBottom(300);
                });
              });
            }, err => {

            });
          });
        });
      }
    });
  }

  ionViewWillLeave() {
    this.chat.cohort = this.cohortChat;
    this.storage.get('userCode').then((val) => {
      if (val) {
        const ref = this.afs.firestore.collection('users').where('code', '==', val);
        ref.get().then((result) => {
          result.forEach(doc => {

            this.chat.userID = val;
            this.chat.username = doc.get('username');
            this.chat.profilePic = doc.get('profilePic');
            this.chat.timestamp = firebase.firestore.FieldValue.serverTimestamp();
            this.chat.message = this.chat.username + ' has left the chat';

            this.chatService.addChat(this.chat).then(() => {
              this.chat.message = '';
              this._zone.run(() => {
                setTimeout(() => {
                  this.content.scrollToBottom(300);
                });
              });
            }, err => {

            });
          });
        });
      }
    });
  }

  goToProfile(userID: string, cohort: string) {
    this.router.navigate(['/viewable-profile/', userID]);
    this.storage.set('currentCohort', cohort);
    this.storage.set('currentLoc', '/chat/');
  }
}