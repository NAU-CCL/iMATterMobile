import {Component, OnInit, ViewChild, NgZone} from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { ChatService, Cohort, Chat } from '../../services/chat/chat-service.service';
import {Observable} from 'rxjs';
import * as firebase from 'firebase/app';
import {AngularFirestore} from '@angular/fire/firestore';
import { AnalyticsService, Analytics, Sessions  } from 'src/app/services/analyticsService.service';
import {IonContent} from '@ionic/angular';
import {
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed } from '@capacitor/core';
import {sendChatNotification} from "../../../../functions/src";

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
  type: '',
  visibility: true
};

analytic: Analytics =
{
  page: '',
  userID: '',
  timestamp: '',
  sessionID: ''
};


  private cohortChat: string;
  private chats: Observable<any>;
  private hasEntered: boolean;

  private analyticss : string;
  private sessions : Observable<any>;

  constructor(public _zone: NgZone, private router: Router, private storage: Storage, private chatService: ChatService
    , private afs: AngularFirestore , private analyticsService: AnalyticsService ) {

    this.storage.get('cohort').then((val) => {
      if (val) {
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


    this.chat.message = '';
    this.scrollToBottom();

  }

  ionViewDidEnter() {

    this.getCohort();

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
            this.chat.visibility = true;

            this.chatService.addChat(this.chat).then(() => {
              this.chat.message = '';
              // sendChatNotification();
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

    this.chat.message = '';
    this.scrollToBottom();
    this.addView();
  }




  addView(){

  //this.analytic.sessionID = this.session.id;
  this.storage.get('userCode').then((val) =>{
    if (val) {
      const ref = this.afs.firestore.collection('users').where('code', '==', val);
      ref.get().then((result) =>{
        result.forEach(doc =>{
          this.analytic.page = 'chat';
          this.analytic.userID = val;
          this.analytic.timestamp = firebase.firestore.FieldValue.serverTimestamp();
          //this.analytic.sessionID = this.idReference;
          this.analyticsService.addView(this.analytic).then (() =>{
            console.log('successful added view: chat');

          }, err =>{
            console.log('unsucessful added view: chat');

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
            this.chat.visibility = true;

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
    this.scrollToBottom();
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
            this.chat.type = 'auto';
            this.chat.visibility = true;

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
