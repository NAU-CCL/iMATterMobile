import {Component, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { ToastController } from '@ionic/angular';
import { User } from '../../services/user/auth.service';
import { ChatService, Cohort, Chat } from '../../services/chat/chat-service.service';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-tab1',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {

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

  user: User = {
    code: '',
    username: '',
    email:  '',
    password: '',
    dueMonth: '',
    weeksPregnant: 0,
    location: 0,
    cohort: '',
    bio:  '',
    securityQ: '',
    securityA: '',
    currentEmotion: '',
    profilePic: ''
  };

  private userProfileID: any;
  private cohortChat: string;
  private db: any;
  private id: any;

  constructor(private activatedRoute: ActivatedRoute, public afs: AngularFirestore,
              private toastCtrl: ToastController,
              private storage: Storage,
              private  router: Router,
              private chatService: ChatService) {

    this.storage.get('weeksPregnant').then((val) => {
      if (val) {
        this.user.weeksPregnant = val;
      }
    });

    // setInterval(this.tick, 1000);

  }
  
  ngOnInit() {

    this.storage.get('authenticated').then((val) => {
      if (val === 'false') {
        this.router.navigate(['/login/']);
      }
    });
  }

  ionViewWillEnter() {
    this.userProfileID = this.storage.get('userCode');
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.storage.get('userCode').then((val) => {
      if (val) {
        this.userProfileID = val;
        const ref = this.afs.firestore.collection('users').where('code', '==', val);
        ref.get().then((result) => {
          result.forEach(doc => {
            this.user.username = doc.get('username');
            this.user.profilePic = doc.get('profilePic');
            this.user.email = doc.get('email');
            this.user.password = doc.get('password');
            this.user.weeksPregnant = doc.get('weeksPregnant');
            this.user.bio = doc.get('bio');
            this.user.location = doc.get('location');
            this.user.cohort = doc.get('cohort');
            this.user.currentEmotion = doc.get('mood');
            this.user.code = doc.get('code');
          });
        });
      }
    });
  }

  saveEmotion(emotion: string) {
    this.afs.firestore.collection('users').doc(this.userProfileID)
        .update({mood: emotion});

    this.chat.cohort = this.user.cohort;
    this.chat.userID = this.userProfileID;
    this.chat.username = this.user.username;
    this.chat.profilePic = this.user.profilePic;
    this.chat.timestamp = firebase.firestore.FieldValue.serverTimestamp();
    this.chat.message = this.chat.username + ' is currently feeling ' + emotion;
    this.chat.type = 'auto';

    this.chatService.addChat(this.chat).then(() => {
      this.chat.message = '';
    });
  }

  saveExcited() {
	this.db.collection('users').doc(this.user.code).update({
		mood: 'excited'
	})
  }
 
  saveHappy() {
	this.db.collection('users').doc(this.user.code).update({
		mood: 'happy'
  })
  
  }saveLove() {
    var db = firebase.firestore();	
	db.collection('users').doc(this.user.code).update({
		mood: 'love'
  })
  
  }saveIndifferent() {
    var db = firebase.firestore(); 
	db.collection('users').doc(this.user.code).update({
		mood: 'indifferent'
  })
  
  }saveSad() {
    var db = firebase.firestore();
	db.collection('users').doc(this.user.code).update({
		mood: 'sad'
  })
  
  }saveAngry() {
    var db = firebase.firestore();	
	db.collection('users').doc(this.user.code).update({
		mood: 'angry'
	})
  }

  saveOverwhelmed() {
    var db = firebase.firestore();
	db.collection('users').doc(this.user.code).update({
		mood: 'overwhelmed'
	})
  }


}


