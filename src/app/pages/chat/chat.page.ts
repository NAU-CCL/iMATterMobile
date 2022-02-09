import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { ChatService, Cohort, Chat } from '../../services/chat/chat-service.service';
import { Observable } from 'rxjs';
import * as firebase from 'firebase/app';
import { AngularFirestore } from '@angular/fire/firestore';
import { AnalyticsService, Analytics, Sessions } from 'src/app/services/analyticsService.service';
import { IonContent } from '@ionic/angular';
import {
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed
} from '@capacitor/core';
import { sendChatNotification } from "../../../../functions/src";
import 'rxjs-compat/add/observable/timer';
import { SelectMultipleControlValueAccessor } from '@angular/forms';

const { PushNotifications } = Plugins;

@Component({
  selector: 'app-tab2',
  templateUrl: 'chat.page.html',
  styleUrls: ['chat.page.scss']
})
export class ChatPage implements OnInit {

  @ViewChild('content', { static: true }) content: IonContent;

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
    visibility: true,
    count: 0
  };

  analytic: Analytics =
    {
      page: '',
      userID: '',
      timestamp: '',
      sessionID: ''
    };

  public cohortChat: string;
  public chats: Observable<any>;
  private hasEntered: boolean;

  private analyticss: string;
  private sessions: Observable<any>;
  private numberOfCurrentChats: number;
  private numOfChats: number;

  public userProfileID;

  constructor(public _zone: NgZone,
    private router: Router,
    private storage: Storage,
    private chatService: ChatService,
    private afs: AngularFirestore,
    private analyticsService: AnalyticsService) {
    this.storage.get('cohort').then((val) => {
      if (val) {
        this.cohortChat = val;
        this.chats = this.chatService.getChats(val);
      }
      // this.chats = this.chatService.getChats(this.cohortChat);
      this.scrollToBottom();
    });

    // Event that is suppose to fire when the user leaves to their homescreen.
    document.addEventListener('pause',  () => { this.userWentHomeChatNotify('autoLeft')  }, false);

    // Event that fires when user opens app after leaving app previously.
    document.addEventListener('resume', () => { this.userWentHomeChatNotify('autoEnter') }, false);

    console.log( `The active view is: ${this.router.url}` );
  }

  ngOnInit() {
    this.storage.get('authenticated').then((val) => {
      if (val === 'false') {
        this.router.navigate(['/login/']);
      }
    });

    this.userProfileID = this.storage.get('userCode');
    this.storage.get('userCode').then((val) => {
      if (val) {
        this.userProfileID = val;
      }
    });

    this.storage.get('cohort').then((val) => {
      if (val) {
        this.chats = this.chatService.getChats(val);
        const ref = firebase.firestore().collection('chats').where('cohort', '==', this.cohort.name).orderBy('timestamp');
        ref.get().then((res) => {
          res.forEach(doc => {
            this.numberOfCurrentChats += 1;
          });
        });
      }
    });

    // this.getCohort();

    /*
    const timer = Observable.timer(0, 1000);
    timer.subscribe(tick => {
      console.log('tic');
      const ref = firebase.firestore().collection('chats').where('cohort', '==', this.cohort.name).orderBy('timestamp');
      ref.get().then((res) => {
        this.numOfChats = this.numberOfCurrentChats;
        this.numberOfCurrentChats = 0;
        res.forEach(doc => {
          this.numberOfCurrentChats += 1;
        });
      });

      if (this.numberOfCurrentChats > this.numOfChats) {
        console.log('tick');
        this.scrollToBottom();
      }
    });*/
  }

  ionViewDidEnter() {

    this.addChat('autoEnter');
    this.scrollToBottom();

    this.addView();

  }

  // Notify the chat when the user goes to home screen ie 'user has left chat, user has rejoined chat.'
  userWentHomeChatNotify( enteredOrLeft: string )
  {
    // Get the current url of the app. If we dont check urls then the chat will be notified every single
    // time the user enters or leaves the app regardless of if the user was in the chat.
    let currentURL: string = this.router.url;
    

    if( currentURL == "/tabs/chat/default")
    {
      this.addChat( enteredOrLeft );
    }
    else if( currentURL == "/tabs/chat/default")
    {
      this.addChat( enteredOrLeft );
    }

  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.content.scrollToBottom) {
        this.content.scrollToBottom(100);
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

  toDate(timestamp) {
    return timestamp.toDate();
  }

  async addChat(chatType) {
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
            this.chat.visibility = true;

            if (chatType === 'autoEnter') {

              this.chat.message = this.chat.username + ' has entered the chat test';
              this.chat.type = 'auto';
              this.chatService.addChat(this.chat).then(async (resp) => {
                await new Promise(f => setTimeout(f, 5000));
                console.log("delete chat now " + resp);
                this.chatService.deleteChat(resp.id);
              });

            } else if (chatType === 'autoLeft') {
              this.chat.message = this.chat.username + ' has left the chat';
              this.chat.type = 'auto';
              this.chatService.addChat(this.chat).then(async (resp) => {
                await new Promise(f => setTimeout(f, 5000));
                console.log("delete chat now " + resp);
                this.chatService.deleteChat(resp.id);
              });

            } else {
              this.chat.type = 'user';

              this.chatService.addChat(this.chat);
            }
            this.chat.message = '';
          });
        });
      }
    });
    this.scrollToBottom();
  }

  goToProfile(userID: string, cohort: string) {
    this.router.navigate(['/viewable-profile/', userID]);
    this.storage.set('currentCohort', cohort);
    this.storage.set('currentLoc', '/chat/');
  }


  addView() {

    // this.analytic.sessionID = this.session.id;
    this.storage.get('userCode').then((val) => {
      if (val) {
        const ref = this.afs.firestore.collection('users').where('code', '==', val);
        ref.get().then((result) => {
          result.forEach(doc => {
            this.analytic.page = 'chat';
            this.analytic.userID = val;
            this.analytic.timestamp = firebase.firestore.FieldValue.serverTimestamp();
            // this.analytic.sessionID = this.idReference;
            this.analyticsService.addView(this.analytic).then(() => {
              console.log('successful added view: chat');

            }, err => {
              console.log('unsucessful added view: chat');

            });
          });
        });
      }
    });
  }


  checkForNewChat() {

  }

  ionViewWillLeave() {
    this.addChat('autoLeft');
    // this.storage.get('cohort').then((val) => {
    //   if (val) {
    //     this.chatService.iterateChats(val, 'ionViewWillLeave').then(() => {
    //       this.chats = this.chatService.getChats(val);
    //     });
    //   }
    // });
  }

}
