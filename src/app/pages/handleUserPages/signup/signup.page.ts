import { Component, OnInit } from '@angular/core';
import { AuthServiceProvider, User } from '../../../services/user/auth.service';
import { FcmService } from '../../../services/pushNotifications/fcm.service';
import {LoadingController, AlertController, ToastController} from '@ionic/angular';
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

  constructor(
      private authService: AuthServiceProvider,
      private loadingCtrl: LoadingController,
      private alertCtrl: AlertController,
      private formBuilder: FormBuilder,
      private activatedRoute: ActivatedRoute,
      private router: Router,
      private ionicStorage: Storage,
      private fcm: FcmService,
      public afs: AngularFirestore,
      private toastCtrl: ToastController,
  ) {

    this.getSecurityQs();
    this.getAutoProfilePic();
    this.getProfilePictureChoices();

    this.signupForm = this.formBuilder.group({
      email: [
        '',
        Validators.compose([Validators.required, Validators.email]),
      ],
      password: [
        '',
        Validators.compose([Validators.minLength(8), Validators.required]),
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
  public signupForm: FormGroup;
  public loading: any;
  private id: any;
  private readMore: boolean;
  private allPicURLs: any;
  private picURL: any;
  private showImages: boolean;
  private dueDate: string;
  private currentDate = new Date().toJSON().split('T')[0];
  private maxYear = new Date().getFullYear() + 1;
  private securityQs: Array<string>;
  private autoProfilePic: any;
  private emailUsed: boolean;
  private usernameTaken: boolean;

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
  };

  static findCohort(month: string) {
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

  static findDaysPregnant(totalDays) {
    return totalDays % 7;
  }

  static findWeeksPregnant(totalDays) {
    return Math.floor(totalDays / 7);
  }

  static findTotalDaysPregnant(userDue) {
    const currentDateString = new Date().toJSON().split('T')[0];
    const currentDate = new Date(currentDateString);
    const userDueDate = new Date(userDue);
    const dateDiff = Math.abs(currentDate.getTime() - userDueDate.getTime());
    const diffInDays = Math.ceil(dateDiff / (24 * 3600 * 1000));
    const totalDays = 280 - diffInDays;

    return totalDays;
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }

  async signupUser(signupForm: FormGroup): Promise<void> {
    if (!signupForm.valid) {
      console.log(
          'Need to complete the form, current value: ', signupForm.value
      );

      this.showToast('Please enter: ' +  signupForm.value.toString());
    } else {

      this.user.code = this.id;
      this.user.username = signupForm.value.username;
      this.user.email =  signupForm.value.email;
      this.user.password = signupForm.value.password;
      this.user.dueDate = signupForm.value.dateDue.split('T')[0];
      this.user.location = signupForm.value.location;
      this.user.bio = signupForm.value.bio;
      this.user.profilePic = this.picURL;
      this.user.securityQ = signupForm.value.securityQ;
      this.user.securityA = signupForm.value.securityA;
      this.user.joined = firebase.firestore.FieldValue.serverTimestamp();


      // find user current pregnancy status
      this.user.totalDaysPregnant = SignupPage.findTotalDaysPregnant(this.user.dueDate);
      this.user.weeksPregnant = SignupPage.findWeeksPregnant(this.user.totalDaysPregnant);
      this.user.daysPregnant = SignupPage.findDaysPregnant(this.user.totalDaysPregnant);

      // find user cohort
        // get user due month
      const tempCohort = this.user.dueDate.split('-');
      this.user.cohort = SignupPage.findCohort(tempCohort[1]);

      this.afs.firestore.collection('users').where('email', '==', this.user.email)
          .get().then(snapshot => {
        if (snapshot.docs.length > 0) {
          console.log(('taken'));
          this.emailUsed = true;
          this.showToast('Email already in use!');
        } else {
          this.afs.firestore.collection('users').where('username', '==', this.user.username)
              .get().then(snap => {
            if (snap.docs.length > 0) {
              console.log(('taken'));
              this.usernameTaken = true;
              this.showToast('Username taken!');
            } else {
              this.authService.signupUser(this.user).then(
                  () => {
                    /*
                    this.loading.dismiss().then(() => {
                      // this.ionicStorage.set('userCode', this.user.code);
                      this.showToast('You have created an account');
                 
                     */
                      this.router.navigate(['/login']);
                   // });
                  },
                  error => {
                    /*
                    this.loading.dismiss().then(async () => {
                      const alert = await this.alertCtrl.create({
                        message: error.message,
                        buttons: [{text: 'Ok', role: 'cancel'}],
                      });
                      await alert.present();
                    });*/
                    this.showToast('An error occurred while creating your account');
                  }
              );
              // this.loading = await this.loadingCtrl.create();
              // await this.loading.present();
            }
          });
        }
      });
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

  checkEmail(email): any {

    this.afs.firestore.collection('users').where('email', '==', email)
        .get().then(snapshot => {
          if (snapshot.docs.length > 0) {
            console.log(('taken'));
            this.emailUsed = true;
          } else {
            this.emailUsed = false;
          }
        });
  }

  checkUsername(username): any {
    let taken = false;
    this.afs.firestore.collection('users').where('username', '==', username)
        .get().then(snapshot => {
      if (snapshot.docs.length > 0) {
        console.log(('taken'));
        taken =  true;
        return true;
      }
    });
  }



  getSecurityQs() {
    firebase.firestore().collection('mobileSettings').doc('userSignUpSettings').get().then((result) => {
      this.securityQs = result.get('securityQs');
    });
  }

  getAutoProfilePic() {
    firebase.firestore().collection('mobileSettings').doc('userSignUpSettings').get().then((result) => {
      this.picURL = result.get('autoProfilePic');
    });
  }

  getProfilePictureChoices() {
    firebase.firestore().collection('mobileSettings').doc('userSignUpSettings').get().then((result) => {
      this.allPicURLs = result.get('profilePictures');
    });
  }

  showToast(msg) {
    this.toastCtrl.create({
      message: msg,
      duration: 2000
    }).then(toast => toast.present());
  }

}
