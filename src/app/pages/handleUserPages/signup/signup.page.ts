import { Component, OnInit } from '@angular/core';
import { AuthServiceProvider, User } from '../../../services/user/auth.service';
import { FcmService } from '../../../services/pushNotifications/fcm.service';
import { LoadingController, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { storage } from 'firebase';
import 'firebase/storage';
import * as firebase from 'firebase/app';
import {AngularFirestore} from '@angular/fire/firestore';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  public signupForm: FormGroup;
  public loading: any;
  private id: any;
  private readMore: boolean;
  private allPicURLs: any;
  private picURL: any;
  private showImages: boolean;
  private dueDate: string;
  private currentDate = new Date().toJSON().split('T')[0];
  private securityQ1: string;
  private securityQ2: string;
  private securityQ3: string;

  constructor(
      private authService: AuthServiceProvider,
      private loadingCtrl: LoadingController,
      private alertCtrl: AlertController,
      private formBuilder: FormBuilder,
      private activatedRoute: ActivatedRoute,
      private router: Router,
      private ionicStorage: Storage,
      private fcm: FcmService,
      public afs: AngularFirestore
  ) {

    this.getSecurityQs();

    const fbstorage = firebase.storage();
    const storageRef = fbstorage.ref('/ProfileImages');
    this.allPicURLs = ['https://firebasestorage.googleapis.com/v0/b/techdemofirebase.appspot.com/o/ProfileImages%2Fauto.png?alt=media&token=e5601f32-30f8-4b38-9a2c-ff2d7e6ad59a',
      'https://firebasestorage.googleapis.com/v0/b/techdemofirebase.appspot.com/o/ProfileImages%2Fbabyfeet.png?alt=media&token=8d49bc52-416a-453b-b8a2-5d539451e107',
      'https://firebasestorage.googleapis.com/v0/b/techdemofirebase.appspot.com/o/ProfileImages%2Fbird.png?alt=media&token=b5fd7b2f-e144-4882-b0d4-ec1cee437a1c',
      'https://firebasestorage.googleapis.com/v0/b/techdemofirebase.appspot.com/o/ProfileImages%2Fbutterfly.png?alt=media&token=48df652b-f133-46b2-9d56-2102cf473c11',
      'https://firebasestorage.googleapis.com/v0/b/techdemofirebase.appspot.com/o/ProfileImages%2Fheart.png?alt=media&token=351f8425-190b-4158-91ac-2bf282051d38',
      'https://firebasestorage.googleapis.com/v0/b/techdemofirebase.appspot.com/o/ProfileImages%2Fpeacock.png?alt=media&token=27ed19f3-3a01-464d-843d-7cfca96e0281',
      'https://firebasestorage.googleapis.com/v0/b/techdemofirebase.appspot.com/o/ProfileImages%2Fpurpleflower.png?alt=media&token=f863d5b3-0d92-4ce0-b1b4-ac643f7c3728',
      'https://firebasestorage.googleapis.com/v0/b/techdemofirebase.appspot.com/o/ProfileImages%2Fredflower.png?alt=media&token=36754216-f5cf-4a38-967a-f024fb60cce7',
    ];

    this.picURL = 'https://firebasestorage.googleapis.com/v0/b/techdemofirebase.appspot.com/o/ProfileImages%2Fauto.png?alt=media&token=e5601f32-30f8-4b38-9a2c-ff2d7e6ad59a';

    this.signupForm = this.formBuilder.group({
      email: [
        '',
        Validators.compose([Validators.required, Validators.email]),
      ],
      password: [
        '',
        Validators.compose([Validators.minLength(6), Validators.required]),
      ],
      username: [
        '',
        Validators.compose([Validators.required, Validators.maxLength(21)]),
      ],
      dateDue: [
        '',
        Validators.compose([Validators.required]),
      ],
      location: [
        '',
        Validators.compose([Validators.nullValidator, Validators.pattern('(^\\d{5}$)')]),
      ],
      bio: [
        '',
        Validators.compose([Validators.nullValidator, Validators.maxLength(300)]),
      ],
      securityQ: [
        '',
        Validators.compose([Validators.required, Validators.maxLength(300)]),
      ],
      securityA: [
        '',
        Validators.compose([Validators.required, Validators.maxLength(300)]),
      ],
    });
  }

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
    token: ''
  };

  ngOnInit() {}

  ionViewWillEnter() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }

  async signupUser(signupForm: FormGroup): Promise<void> {
    if (!signupForm.valid) {
      console.log(
          'Need to complete the form, current value: ', signupForm.value
      );
    } else {
      const email: string = signupForm.value.email;
      const password: string = signupForm.value.password;
      const username: string = signupForm.value.username;
      const dateDue: string = signupForm.value.dateDue;
      const securityQ: string = signupForm.value.securityQ;
      const securityA: string = signupForm.value.securityA;
      const location: number = signupForm.value.location;
      const bio: string = signupForm.value.bio;



      this.user.code = this.id;
      this.user.username = username;
      this.user.email =  email;
      this.user.password = password;
      this.user.dueDate = dateDue.split('T')[0];
      this.user.location = location;
      this.user.bio = bio;
      this.user.profilePic = this.picURL;
      this.user.securityQ = securityQ;
      this.user.securityA = securityA;
      this.user.joined = firebase.firestore.FieldValue.serverTimestamp();
      this.user.daysAUser = 0;
      this.user.weeksPregnant = 0;
      this.user.totalDaysPregnant = 0;
      this.user.daysPregnant = 0;
      this.user.chatNotif = true;
      this.user.points = 0;

      // find user cohort
      const tempCohort = this.user.dueDate.split('-');
      console.log(tempCohort);
      this.user.cohort = this.findCohort(tempCohort[1]);

      this.authService.signupUser(this.user).then(
          () => {
            this.loading.dismiss().then(() => {
              // this.ionicStorage.set('userCode', this.user.code);
              this.router.navigate(['/login' ]);
            });
          },
          error => {
            this.loading.dismiss().then(async () => {
              const alert = await this.alertCtrl.create({
                message: error.message,
                buttons: [{ text: 'Ok', role: 'cancel' }],
              });
              await alert.present();
            });
          }
      );
      this.loading = await this.loadingCtrl.create();
      await this.loading.present();
    }
  }

  showMore() {
    this.readMore = true;
  }

  showLess() {
    this.readMore = false;
  }

  showPics() {
    this.showImages = true;
  }

  changePic(url: string) {
    this.showImages = false;
    this.picURL = url;
  }

  findCohort(month: string) {
    let cohort = '';

    if (month === '01') {
      cohort = 'January';
    } else if (month === '02') {
      cohort = 'February';
    } else if (month === '03') {
      cohort = 'March';
    } else if (month === '04') {
      cohort = 'April';
    } else if (month === '05') {
      cohort = 'May';
    } else if (month === '06') {
      cohort = 'June';
    } else if (month === '07') {
      cohort = 'July';
    } else if (month === '08') {
      cohort = 'August';
    } else if (month === '09') {
      cohort = 'September';
    } else if (month === '10') {
      cohort = 'October';
    } else if (month === '11') {
      cohort = 'November';
    } else if (month === '12') {
      cohort = 'December';
    }

    return cohort;
  }

  getSecurityQs() {
    firebase.firestore().collection('mobileSettings').doc('securityQuestions').get().then((result) => {
      this.securityQ1 = result.get('q1');
      this.securityQ2 = result.get('q2');
      this.securityQ3 = result.get('q3');

    });
  }
}
