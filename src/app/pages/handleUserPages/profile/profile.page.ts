import { Component, OnInit } from '@angular/core';
import {AlertController, ToastController} from '@ionic/angular';
import {AuthServiceProvider, User} from '../../../services/user/auth.service';
import { ProfileService } from '../../../services/user/profile.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import * as firebase from 'firebase/app';
import { AnalyticsService, Analytics, Sessions  } from 'src/app/services/analyticsService.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
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
      };

  private userProfileID: any;
    public pointsForRedemption: any;
  private analyticss: string;
  private sessions: Observable<any>;
    public canRedeemPoints: boolean;
    public displayRedeemOptions: boolean;
    public chosenGCType: string;
    public gcTypes: Array<string>;

    static checkUserPoints(userPoints, pointsNeeded): boolean {
        return userPoints >= pointsNeeded;
    }

  constructor(
      private alertCtrl: AlertController,
      private authService: AuthServiceProvider,
      private profileService: ProfileService,
      private router: Router,
      private activatedRoute: ActivatedRoute,
      private afs: AngularFirestore,
      private storage: Storage,
      private analyticsService: AnalyticsService,
      private alertController: AlertController,
      private toastCtrl: ToastController,
      private http: HttpClient
  ) {}

  ngOnInit() {
      this.storage.get('authenticated').then((val) => {
          if (val === 'false') {
              this.router.navigate(['/login/']);
          }
      });

      this.displayRedeemOptions = false;
  }

  // get user info
  ionViewWillEnter() {
    this.addView();
    this.refreshPage();
  }

  updateLogOut() {
   this.analyticsService.updateLogOut(this.session);
   console.log('added LogOutTime');
  }

  addView() {
  //this.analytic.sessionID = this.session.id;
  this.storage.get('userCode').then((val) =>{
    if (val) {
      const ref = this.afs.firestore.collection('users').where('code', '==', val);
      ref.get().then((result) =>{
        result.forEach(doc =>{
          this.analytic.page = 'profile';
          this.analytic.userID = val;
          this.analytic.timestamp = firebase.firestore.FieldValue.serverTimestamp();
          //this.analytic.sessionID = this.idReference;
          this.analyticsService.addView(this.analytic).then (() =>{
            console.log('successful added view: profile');

          }, err => {
            console.log('unsucessful added view: profile');

          });
        });
      });
    }
  });
}

  // log user out, sets authentication to false and removes some unnecessary storage
  logOut(): void {
    this.storage.set('authenticated', 'false');
    this.storage.remove('userCode');
    this.storage.remove('totalDaysPregnant');
    this.storage.remove('weeksPregnant');
    this.storage.remove('daysPregnant');
    this.router.navigateByUrl('login');
  }

    validateEmail(email) {
        if ( /(.+)@(.+){2,}\.(.+){2,}/.test(email)) {
            return true;
        } else {
            return false;
        }
    }

  // allows user to update email if the put in their current password
  async updateEmail(): Promise<void> {
    const alert = await this.alertCtrl.create({
        header: 'Update Email',
      inputs: [
        { type: 'text', name: 'newEmail', placeholder: 'Your new email' },
        { name: 'password', placeholder: 'Your password', type: 'password' },
      ],
      buttons: [
        { text: 'Cancel' },
        {
          text: 'Save',
          handler: data => {
            if (this.validateEmail(data.newEmail)) {
                this.profileService.updateEmail(data.newEmail, data.password, this.userProfileID)
                    .then(() => {
                            this.showToast('Your email has been updated!');
                            this.storage.set('email', data.newEmail);
                            this.refreshPage();
                        },
                        err => {
                            this.showToast('There was a problem updating your email');
                        });
            } else {
                    alert.message = 'Invalid Email';
                    return false;
                }
            },
        },
      ],
    });
    await alert.present();
  }

  async updatePassword(): Promise<void> {
    const alert = await this.alertCtrl.create({
        header: 'Update Password',
      inputs: [
        { name: 'oldPassword', placeholder: 'Old password', type: 'password' },
        { name: 'newPassword', placeholder: 'New password', type: 'password' },
      ],
      buttons: [
        { text: 'Cancel' },
        { text: 'Save',
          handler: data => {
            if (data.newPassword.length >= 8) {
              this.profileService.updatePassword(data.newPassword, data.oldPassword, this.userProfileID)
                  .then(() => {
                          this.showToast('Your password has been updated!');
                          this.refreshPage();
                      },
                      err => {
                          this.showToast('There was a problem updating your password');
                      });
          } else {
                  alert.message = 'Password must be 8 characters or longer';
                  return false;
              }
          },
        },
      ],
    });
    await alert.present();
  }

  validateLocation(zip) {
    if (/^[0-9]{5}(?:-[0-9]{4})?$/.test(zip) || zip === '') {
        return true;
    } else {
        return false;
    }
  }

  async updateLocation(): Promise<void> {
    const alert = await this.alertCtrl.create({
        header: 'Update Location (Zip Code)',
        inputs: [
            { type: 'text', name: 'newLocation', placeholder: 'Leave empty to remove'},
        ],
        buttons: [
            { text: 'Cancel' },
            { text: 'Save',
              handler: data => {

                if (this.validateLocation(data.newLocation)) {
                this.profileService.updateLocation(data.newLocation, this.userProfileID)
                    .then(() => {
                        this.showToast('Your location has been updated!');
                        this.refreshPage();
                        },
                        err => {this.showToast('There was a problem updating your location');
                        });
                } else {
                    alert.message = 'Invalid Zip Code';
                    return false;
                }
                },
            },
        ],
    });
    await alert.present();
    }

  async updateBio(): Promise<void> {
     const alert = await this.alertCtrl.create({
         header: 'Update Bio',
         inputs: [
             { type: 'text', name: 'newBio', placeholder: 'Nothing personal!' },
         ],
         buttons: [
             { text: 'Cancel' },
             {text: 'Save',
                 handler: data => {
                 this.profileService.updateBio(data.newBio, this.userProfileID)
                     .then(() => {
                         this.showToast('Your bio has been updated!');
                         this.refreshPage(); },
                     err => {this.showToast('There was a problem updating your bio');
                     });
                 },
             },
         ],
     });
     await alert.present();
    }

  /**
   * Grabs the user's necessary info for the profile
   * Can be called to refresh the data on the page
   */
  refreshPage() {
      this.storage.get('userCode').then((val) => {
          if (val) {
              this.userProfileID = val;
              const ref = this.afs.firestore.collection('users').where('code', '==', val);
              ref.get().then((result) => {
                  result.forEach(doc => {
                      this.user.username = doc.get('username');
                      this.user.email = doc.get('email');
                      this.user.password = doc.get('password');
                      this.user.bio = doc.get('bio');
                      this.user.location = doc.get('location');
                      this.user.cohort = doc.get('cohort');
                      this.user.currentEmotion = doc.get('mood');
                      this.user.profilePic = doc.get('profilePic');
                      this.user.points = doc.get('points');

                      const pointRef = firebase.firestore().collection('mobileSettings').doc('giftCardSettings').get();
                      pointRef.then((res) => {
                          this.pointsForRedemption =  res.get('points');
                          this.gcTypes = res.get('types');
                          this.canRedeemPoints = ProfilePage.checkUserPoints(this.user.points, this.pointsForRedemption);
                      });
                  });
              });
          }
      });
  }

  // gets admin set point amount and uses that to
  displayPointInfo() {
      const pointRef = firebase.firestore().collection('mobileSettings').doc('giftCardSettings').get();
      pointRef.then((res) => {
          const points = res.get('points');
          this.presentAlert('Earning Points',
              'You can earn points by completing surveys and answering learning module questions. Once you have earned ' +
              + points + ' points, you will see a redeem button, which you may press to use your points to get a gift card for $5');
      });
  }

    // this function deducts the admin set point amount from the user
    // and sends an email to the admin set email
    redeemGiftCard(currentPoints, pointsUsed, gcType, email, username) {

        this.profileService.updatePoints(currentPoints, pointsUsed, this.userProfileID);
        this.displayRedeemOptions = false;

        this.refreshPage();

        // send an email
        firebase.firestore().collection('mobileSettings').doc('giftCardSettings').get().then((result) => {
            const adminEmail = result.get('email');
            this.profileService.addToRedeemTable(adminEmail, email, username, gcType);
        });
        this.showToast('An email was sent for your gift card request!');
    }

    // present a basic alert -- used for displaying gc info
    async presentAlert(header: string, message: string) {
        const alert = await this.alertController.create({
            header,
            message,
            buttons: ['OK']
        });
        await alert.present();
    }

    showToast(msg) {
        this.toastCtrl.create({
            message: msg,
            duration: 2000
        }).then(toast => toast.present());
    }

}


