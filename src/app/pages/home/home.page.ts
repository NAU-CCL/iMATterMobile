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
import { FireService } from 'src/app/services/survey/fire.service';
import { MoodProviderNotifService, EmotionNotif } from "../../services/mood-provider-notif.service";


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
    type: '',
    visibility: true,
    count: 0
  };

  user: User = {
    code: '',
    username: '',
    email:  '',
    password: '',
    dueDate: '',
    location: 0,
    cohort: '',
    weeksPregnant: '',
    daysPregnant: '',
    totalDaysPregnant: '',
    bio:  '',
    securityQ: '',
    securityA: '',
    currentEmotion: '',
    profilePic: '',
    joined: '',
    daysAUser: 0,
    points: 0,
    chatNotif: true,
    learningModNotif: true,
    surveyNotif: true,
    infoDeskNotif: true,
    token: '',
    recentNotifications: [],
    answeredSurveys: [],
    codeEntered: true
  };

  emotionNotif: EmotionNotif = {
    userID: '',
    username: '',
    emotionEntered: '',
    viewed: false,
    timestamp: ''
};

    analytic: Analytics =
  {
    page: '',
    userID: '',
    timestamp: '',
    sessionID: ''
  };



  session : Sessions =
      {
          userID: '',
          LogOutTime: '',
          LoginTime: '',
          numOfClickChat: 0,
          numOfClickCalendar: 0,
          numOfClickLModule: 0,
          numOfClickInfo: 0,
          numOfClickSurvey: 0,
          numOfClickProfile: 0,
          numOfClickMore: 0,
          numOfClickHome: 0
      }

  public dropDown: any = [];
  public expandSize;
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
              private analyticsService: AnalyticsService,
              private fs: FireService,
              private mpnService: MoodProviderNotifService) {
                this.dropDown = [{ expanded: false }];
  }

  ngOnInit() {

    this.storage.get('authenticated').then((val) => {
      if (val === 'false') {
        this.router.navigate(['/login/']);
      }
    });

    this.userProfileID = this.storage.get('userCode');
    //this.id = this.activatedRoute.snapshot.paramMap.get('id');
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
            this.user.weeksPregnant = doc.get('weeksPregnant');
            this.user.daysPregnant = doc.get('daysPregnant');
            this.user.totalDaysPregnant = doc.get('totalDaysPregnant');
            this.user.password = doc.get('password');
            this.user.bio = doc.get('bio');
            this.user.location = doc.get('location');
            this.user.cohort = doc.get('cohort');
            this.user.currentEmotion = doc.get('mood');
            this.user.code = doc.get('code');
            const pregUpdateRef = this.afs.firestore.collection('pregnancyUpdates')
                .where('day', '==', this.user.totalDaysPregnant);
            pregUpdateRef.get().then((res) => {
              res.forEach(document => {
                this.pregnancyCard.day = document.get('day');
                this.pregnancyCard.picture = document.get('picture');
                this.pregnancyCard.description = document.get('description');
              });
            });

          });
        });
      }
    });

    
    /*

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
    });*/

  }

  ionViewWillEnter() {
  this.addView();
  
    this.storage.get('userCode').then((val) => {
      if (val) {
        this.userProfileID = val;
        const ref = this.afs.firestore.collection('users').where('code', '==', val);
        ref.get().then((result) => {
          result.forEach(doc => {
            this.user.recentNotifications = doc.get('recentNotifications');
            this.expandSize = (150 + 50 * this.user.recentNotifications.length) + "px"
          });
        });
      }
    });
  }

  updateProfileClicks() {
    this.analyticsService.updateProfileClicks(this.session);
    console.log("added profile click");

  }


  updateLModuleClicks()
  {
    this.analyticsService.updateLModuleClicks(this.session);
    console.log("added learning module click");

  }



  updateSurveyClicks()
  {
    this.analyticsService.updateSurveyClicks(this.session);
    console.log("added survery click");

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
    this.chat.type = 'emotion';
    this.chat.visibility = true;

    this.chatService.addChat(this.chat).then(() => {
      this.chat.message = '';
    });

    if (emotion === 'sad' || emotion === 'overwhelmed' || emotion === 'angry') {
      this.presentAlert('Stay Strong!',
          'Remember you have your cohort to support you and health modules available to you!');

      this.emotionNotif.userID = this.userProfileID;
      this.emotionNotif.username = this.user.username;
      this.emotionNotif.emotionEntered = emotion;
      this.emotionNotif.timestamp = firebase.firestore.FieldValue.serverTimestamp();
      this.mpnService.addEmotionNotif(this.emotionNotif);
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
  expandItem(drop): void {
    if (drop.expanded) {
      drop.expanded = false;
    } else {
      this.dropDown.map(listItem => {
        if (drop == listItem) {
          listItem.expanded = !listItem.expanded;
        } else {
          listItem.expanded = false;
        }
        return listItem;
      });
    }
  }

  clearArray(){
    this.user.recentNotifications = [];
    this.fs.updateRecentNot(this.user.code, this.user.recentNotifications);
  }

  goToPage(notif){
    var surveyID;
    if(notif.split(",")[0] == "There is a new survey available"){
      surveyID = notif.split(",")[1];
      this.router.navigate(['/available/' + surveyID])
    }
    else{
      this.router.navigate(['/learning-center'])
    }
  }

  doRefresh(event) {
    console.log('Begin async operation');
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }

  refreshList() {
    const ref = this.afs.firestore.collection('users').doc(this.user.code);
    ref.get().then((result) => {
      // result.forEach(doc => {
        this.user.recentNotifications = result.get('recentNotifications');
        this.expandSize = (150 + 50 * this.user.recentNotifications.length) + "px"
      //});
    });
  }
}
