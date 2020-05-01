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
  public readMore: boolean;
  public allPicURLs: any;
  public picURL: any;
  public showImages: boolean;
  private dueDate: string;
  public currentDate = new Date().toJSON().split('T')[0];
  public maxYear = new Date().getFullYear() + 1;
  public securityQs: Array<string>;
  public autoProfilePic: any;
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
    codeEntered: true
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
                    this.ionicStorage.set('userCode', this.user.code);

                    /*
                    this.loading.dismiss().then(() => {

                      this.showToast('You have created an account');

                     */
                    this.showToast('You have created an account');
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

      //populate learning modules upon signup
      this.populateLearningModules();
      //populate surveys upon signup
      this.populateSurveys();
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

  /**
   * Goes through learning modules and updates userVisibility so this user will have 
   * relevant LMs displayed to them upon signup (without running timed cloud function)
   * Recycled code from index.js in cloud function code
   */
  populateLearningModules()
  {
    const learningModules = this.afs.firestore.collection('learningModules');
    var userCode;
  
    learningModules.get().then((value) => {
      value.forEach(learningModule => {
  
        var moduleActive = learningModule.get("moduleActive");
        //Skip over this module if it's not active
        if (moduleActive == false)
        {
          return; //return acts as "continue" in forEach loop
        }
        
        var lmUserVisibility = learningModule.get("userVisibility");
        var storedLMUserVisibility = learningModule.get("userVisibility");
        //overdoing the splitting but does the job
        var moduleVisibility = learningModule.get("moduleVisibilityTime").split(/(?:,| )+/);
        var moduleExpiration = learningModule.get("moduleExpiration");
  
        var userDaysPregnant = this.user.totalDaysPregnant;

        //Check to see this value exists/is valid
        if (userDaysPregnant == null)
        {
          //return as as "continue" in forEach loop
          return;
        }

        userCode = this.user.code;

        //for each week in the module visibility list
        moduleVisibility.forEach(week => {

          //if module is to always be displayed
          if (week == 0)
          {
            lmUserVisibility.push(userCode);

          }
          else
          {
            var daysStart = 7 * week; //number of days pregnant this module would start at
            var daysEnd;

            //if the module is never supposed to expire
            if (moduleExpiration == 0)
            {
              daysEnd = daysStart + 100000; //add a large number of days (274 years)
            }
            else
            {
              daysEnd = daysStart + moduleExpiration; //number of days pregnant this module would end
            }

            //If user is within the days this LM should be visible to them
            if (userDaysPregnant >= daysStart && userDaysPregnant <= daysEnd)
            {
              //to cover the case where intervals of visibility possibly overlap
              //prevent user code from being pushed more than once
              if (!lmUserVisibility.includes(userCode))
              {
                lmUserVisibility.push(userCode);
              }
            }
          }
        });
          //IMPORTANT: update the userVisibility array
          learningModules.doc(learningModule.id).update({previousUserVisibility: storedLMUserVisibility});
          learningModules.doc(learningModule.id).update({userVisibility: lmUserVisibility});
      });
    });
  }

  populateSurveys(){
    // grab the survey collection
    const surveys = this.afs.firestore.collection('surveys');
    // initialize today's date
    const today = new Date();
    // declare userCode variable for later use
    var userCode;
  
    // for each individual survey in the collection do the following
    surveys.get().then((value) => {
      value.forEach(survey => {
        // get the survey type
        var surveyType = survey.get("type");
        
        // get the user visibility array of the survey
        var surveyUserVisibility = survey.get("userVisibility");
  
        // get the expiration days of the survey
        var expireDays = survey.get("daysTillExpire")
        
        // assign the user code 
        userCode = this.user.code;

        // if the survey type is After Joining
        if(surveyType == 'After Joining'){
          // declare daysArray which will have all of the days that the survey will appear
          var daysArray = survey.get("daysTillRelease").split(/(?:,| )+/);

          // for each day in the array check if the user has been a user for that many days, if so
          // add the user code to the userVisibility array to make sure the survey is visible to them
          daysArray.forEach(day => {
            if(this.user.daysAUser >= parseInt(day) && this.user.daysAUser <= parseInt(day) + expireDays){
              surveyUserVisibility.push(userCode);
            }
          })

        }

        // if the survey type is Due Date
        if(surveyType == 'Due Date'){
          // declare daysArray which will have all of the days that the survey will appear
          var daysArray = survey.get("daysBeforeDueDate").split(/(?:,| )+/);
          // grab the user's DueDate and make it into an array of [month, day, year]
          var userDueDate = this.user.dueDate.split('-');
          // make it into a date object
          var dateDue = new Date(userDueDate[1] + "/" + userDueDate[2] + "/" + userDueDate[0]);
          // subtract the current day from the dueDate and get the time in ms
          var timeBeforeDue =  dateDue.getTime() - today.getTime();
          // convert the time into days
          var daysBeforeDue = Math.trunc( timeBeforeDue / (1000 * 3600 * 24) );

          // for each day in the array check if the user's due date is within the those days, if so
          // add the user code to the userVisibility array to make sure the survey is visible to them
          daysArray.forEach(day => {
            if(daysBeforeDue <= parseInt(day) && daysBeforeDue >= parseInt(day) - expireDays){
              surveyUserVisibility.push(userCode);
            }
          })
        }

        // Survey Type Emotion doesn't check userVisibility, so there is no need to handle them here
        // Survey Type Inactive a user cannot be inactive if they just signed up, so there is no need to handle

          //IMPORTANT: update the userVisibility array
          surveys.doc(survey.id).update({userVisibility: surveyUserVisibility});
      });
    });
  }

}
