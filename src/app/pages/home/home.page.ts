import {Component, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { ToastController, AlertController } from '@ionic/angular';
import { User } from '../../services/user/auth.service';
import { ChatService, Cohort, Chat } from '../../services/chat/chat-service.service';
import { AnalyticsService, Analytics, Sessions  } from 'src/app/services/analyticsService.service';
import * as firebase from 'firebase/app';
import {Observable} from 'rxjs';


@Component({
  selector: 'app-tab1',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {

  pregnancyCard = {
    day: '',
    picture: '',
    description: ''
  };

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
    dueDate: '',
    location: 0,
    cohort: '',
    bio:  '',
    securityQ: '',
    securityA: '',
    currentEmotion: '',
    profilePic: '',
    joined: '',
    daysAUser: 0
  };


    analytic: Analytics =
  {
    page: '',
    userID: '',
    timestamp: '',
    sessionID: ''
  }

  session : Sessions =
  {
    userID: '',
    LogOutTime: '',
    LoginTime: '',
  }

  private userProfileID: any;
  private id: any;
  private weeksPregnant: any;
  private daysPregnant: any;
  private totalDaysPregnant: any;
  private analyticss : string;
  private sessions : Observable<any>;

  constructor(private activatedRoute: ActivatedRoute, public afs: AngularFirestore,
              private toastCtrl: ToastController,
              private storage: Storage,
              private  router: Router,
              private chatService: ChatService,
              private alertController: AlertController,
              private analyticsService: AnalyticsService) {
  }

  ngOnInit() {

    this.storage.get('authenticated').then((val) => {
      if (val === 'false') {
        this.router.navigate(['/login/']);
      }
    });

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
            this.user.dueDate = doc.get('dueDate');
            this.user.password = doc.get('password');
            this.user.bio = doc.get('bio');
            this.user.location = doc.get('location');
            this.user.cohort = doc.get('cohort');
            this.user.currentEmotion = doc.get('mood');
            this.user.code = doc.get('code');

          });
        });
      }
    });

    this.storage.get('weeksPregnant').then((val) => {
      if (val) {
        this.weeksPregnant = val;
        console.log(val);

      }
    });

    this.storage.get('daysPregnant').then((val) => {
      if (val >= 0 ) {
        this.daysPregnant = val;
        console.log(val);

      }
    });

    this.storage.get('totalDaysPregnant').then((val) => {
      if (val) {
        this.totalDaysPregnant = val.toString();
        console.log(val);
        const ref = this.afs.firestore.collection('pregnancyUpdates')
            .where('day', '==', this.totalDaysPregnant);
        ref.get().then((result) => {
          result.forEach(doc => {
            this.pregnancyCard.day = doc.get('day');
            this.pregnancyCard.picture = doc.get('picture');
            this.pregnancyCard.description = doc.get('description');
          });
        });
      }
    });

  }

  ionViewWillEnter() {
  this.addView();

  }


  addView(){

  //this.analytic.sessionID = this.session.id;
  this.storage.get('userCode').then((val) =>{
    if (val) {
      const ref = this.afs.firestore.collection('users').where('code', '==', val);
      ref.get().then((result) =>{
        result.forEach(doc =>{
          this.analytic.page = 'home';
          this.analytic.userID = val;
          this.analytic.timestamp = firebase.firestore.FieldValue.serverTimestamp();
          //this.analytic.sessionID = this.idReference;
          this.analyticsService.addView(this.analytic).then (() =>{
            console.log('successful added view: home');

          }, err =>{
            console.log('unsucessful added view: home');

          });
        });
      });
    }
  });
}



  saveEmotion(emotion: string) {
    this.afs.firestore.collection('users').doc(this.userProfileID)
        .update({mood: emotion});

    this.user.currentEmotion = emotion;

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

    if (emotion === 'sad' || emotion === 'overwhelmed' || emotion === 'angry') {
      this.presentAlert('Stay Strong!',
          'Remember you have your cohort to support you and health modules available to you!');
    }
  }


  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });

    await alert.present();
  }

}
