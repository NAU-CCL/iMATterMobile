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

import {ScrollableDirective} from './scrollable.directive'

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
  // contains the date of the most recent message sent. Updates as messages load and gets older and older to detirmine where
  // message date line dividers should go. Initialize this value to the current date.
  public currentNewestDate: Date =  new Date(); 

  private hasEntered: boolean;

  private analyticss: string;
  private sessions: Observable<any>;
  private numberOfCurrentChats: number;
  private numOfChats: number;

  public userProfileID;

  constructor(public _zone: NgZone,
    private router: Router,
    private storage: Storage,
    public chatService: ChatService,
    private afs: AngularFirestore,
    private analyticsService: AnalyticsService) {
    this.storage.get('cohort').then((val) => {
      if (val) {
        this.cohortChat = val;
        //this.chats = this.chatService.getChats(val);
      }

      // Get new chats. Get chats that were added to the firestore db after the user entered the chat.
      this.chats = this.chatService.getNewChats(this.cohortChat);

      //this.chatService.createTestChats();
      this.scrollToBottom();
    });

    // Event that is suppose to fire when the user leaves to their homescreen.
    document.addEventListener('pause',  () => { this.addAutoChat( 'left' );  }, false);

    // Event that fires when user opens app after leaving app previously.
    document.addEventListener('resume', () => { this.addAutoChat( 'entered' ); }, false);

    //this.chatService.deleteAllAutoChats();

    console.log( `The active view is: ${this.router.url}` );
  }

  ngOnInit() {
    this.chatService.initChatServce('chats', 'timestamp');

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

    /*
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
    */
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

    
    this.scrollToBottom();

    this.addView();

    // Add an auto chat to signify that a user entered the chat room
    this.addAutoChat( 'entered' );

  }

  // Loads chats from before the user joined this chat.
  loadOlderChats( event )
  {
    this.chatService.more();

    // Chats load very fast so the loading animation is hardly visible on pull down.
    this.chatService.loadingChatsObs.subscribe((loadingChats) =>{
      console.log(`Returning done loading ${loadingChats}`);

      if( !loadingChats )
      {
        event.target.complete();
      }
    })
  }

  // Notify the chat when the user goes to home screen ie 'user has left chat, user has rejoined chat.'
  userWentHomeChatNotify( enteredOrLeft: string )
  {
    // Get the current url of the app. If we dont check urls then the chat will be notified every single
    // time the user enters or leaves the app regardless of if the user was in the chat.
    let currentURL: string = this.router.url;
    

    if( currentURL == "/tabs/chat/default")
    {
      // Add code to create auto chat here.
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
    // .toDate is a method of the Timestamp class. Firebase timestamps are returned as Timestamp objects.
    return timestamp.toDate();
  }

  // Timestamp is a timestamp object that represents dates stored in google firebase docs.
  chatSentOnDiffDate( timestamp )
  {
    let chatDate: Date = timestamp.toDate(); // toDate is a Timestamp object method


    if( chatDate < this.currentNewestDate) // // older messages. If date is less than another date than the lesser date is older.
    {
      console.log(`Timestamp ${chatDate} is older than current ${this.currentNewestDate}`);
      
      // Now compare other chat dates to this chats send date.
      this.currentNewestDate = chatDate;
      return true;
    }
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
            this.chat.timestamp = new Date();
            this.chat.visibility = true;
            this.chat.type = 'user';
            this.chatService.addChat(this.chat);
            
            // Chat.message is changed everytime someone enters the new message field on the chat room page. 
            // This line resets the new chat box to empty to after the message is sent the old message is removed.
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

  removeJoinedChatNotif( autoNotifEl )
  {
    autoNotifEl.remove();
  }


  // Create a new chat object to add to the autoChat collection. Called each time user 
  // enters or leaves the chatroom.
  addAutoChat( enteredChat )
  {

    // Get the user code from storage and then query the datbase for the correct user document.
    this.storage.get('userCode').then((currentUserCode) => {
      if (currentUserCode) {
        const ref = this.afs.firestore.collection('users').where('code', '==', currentUserCode);
        ref.get().then((querySnap) => {
          querySnap.forEach(docSnap => {

            // get a js object representing the user document.
            let userDocObject = docSnap.data();
            let newChat = {
              cohort: 'default',
              userID: userDocObject.code,
              message: `${userDocObject.username} has ${enteredChat} the chatroom.`,
              username: 'calvin',
              timestamp: new Date(),
              visibility: true,
              type: enteredChat,
              count: 0 
            }
          
            this.chatService.addAutoChat(newChat, currentUserCode);
          

          })
        })
        }
      })
  }


 

  ionViewWillLeave() {
    this.addAutoChat( 'left' );
  }



}
