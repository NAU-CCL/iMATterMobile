import { Component, OnInit, Version} from '@angular/core';
import { AnalyticsService, Analytics, Sessions  } from 'src/app/services/analyticsService.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { LoadingController, AlertController, Platform} from '@ionic/angular';
import { AuthServiceProvider } from '../../../services/user/auth.service';
import { FcmService } from '../../../services/pushNotifications/fcm.service';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ToastController} from '@ionic/angular';
import { Storage } from '@ionic/storage';

import { BnNgIdleService } from 'bn-ng-idle';
import { Device } from '@ionic-native/device';

import * as firebase from 'firebase/app';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})


export class LoginPage implements OnInit {

    public loginForm: FormGroup;
    public loading: HTMLIonLoadingElement;
    private email: string;
    private password: string;
    private userID: string;
    private userEmail: boolean;
    private userPassword: string;
	private daysSinceLogin: number;

    analytic: Analytics =
  {
    page: '',
    userID: '',
    timestamp: '',
    sessionID: ''
  };

  session: Sessions =
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


  private analyticss: string;
  private sessions: Observable<any>;
    public showEmailBox: boolean;

    constructor(
        public loadingCtrl: LoadingController,
        public alertCtrl: AlertController,
        private authService: AuthServiceProvider,
        private router: Router,
        private formBuilder: FormBuilder,
        private afs: AngularFirestore,
        private toastCtrl: ToastController,
        private storage: Storage,
        private fcm: FcmService,
        private analyticsService: AnalyticsService,
        private platform: Platform,
        private bnIdle: BnNgIdleService
        //private device: Device
    ) {
        this.loginForm = this.formBuilder.group({
            email: ['',
                Validators.compose([Validators.required, Validators.email])],
            password: [
                '',
                Validators.compose([Validators.required]),
            ],
        });

        platform.ready().then(() => {
          this.platform.pause.subscribe(() => {
              console.log('[INFO] App paused');
              this.updateLogOut();
          });

          this.platform.resume.subscribe(() => {
              console.log('[INFO] App resumed');
          });
      });
    }

    ngOnInit() {
        this.storage.set('authenticated', 'false');
        this.storage.get('email').then((val) => {
            if (val > 1) {
                this.showEmailBox = false;
                console.log(val);
            } else {
                this.showEmailBox = true;
            }
        });


    }

    ionViewDidEnter() {
        this.storage.get('email').then((val) => {
            if (val.toString().length > 1) {
                this.showEmailBox = false;
                console.log(val);
            } else {
                this.showEmailBox = true;
            }
        });
    }

    private notificationSetup(userID) {
        this.fcm.getToken(userID);
    }



    updateLogOut() {
     this.analyticsService.updateLogOut(this.session);
     console.log('added LogOutTime');
    }

  addSession() {
  this.storage.get('userCode').then((val) => {
    if (val) {
      const ref = this.afs.firestore.collection('users').where('code', '==', val);
      ref.get().then((result) => {
        result.forEach(doc => {

          this.session.userID = val;
          this.session.LoginTime = firebase.firestore.FieldValue.serverTimestamp();

          this.analyticsService.addSession(this.session).then(()=> {
            console.log('successful session creation');
            console.log(this.session.id);


          }, err => {
          console.log('trouble adding session');

        });
      });
    });
  }
});


}

    validateUser(loginForm: FormGroup) {
        this.storage.get('email').then((val) => {
            if (val) {
                this.email = val.toString();
                this.validateEmailwithPass(val, loginForm.value.password);
            } else {
                this.storage.set('email', loginForm.value.email);
                this.validateEmailwithPass(loginForm.value.email, loginForm.value.password);
            }
        });

    }

    validateEmailwithPass(email, pass) {
        this.afs.firestore.collection('users').where('email', '==', email)
            .get().then(snapshot => {
            if (snapshot.docs.length > 0) {
                console.log(('exists'));
                this.userEmail = true;
                const userRef = this.afs.firestore.collection('users').where('email', '==', email);
                userRef.get().then((result) => {
                    result.forEach(doc => {
                        this.userID = doc.id;
                        this.userPassword = doc.get('password');
                        if ( this.userPassword === pass) {
                            this.addSession();
                            if (this.platform.is('android')) {
                                this.storage.set('platform', 'android');
                            } else if (this.platform.is('ios')) {
                                this.storage.set('platform', 'ios');
                            }

                            //this.storage.set('version', this.device.version);
                            this.storage.set('userCode', this.userID);
                            this.storage.set('authenticated', 'true');
                            this.storage.set('username', doc.get('username'));
                            this.storage.set('dueDate', doc.get('dueDate'));
                            this.storage.set('cohort', doc.get('cohort'));
                            this.storage.set('totalDaysPregnant', doc.get('totalDays'));
                            this.storage.set('weeksPregnant', doc.get('weeksPregnant'));
                            this.storage.set('daysPregnant', doc.get('daysPregnant'));
                            this.storage.set('daysSinceLogin', doc.get('daysSinceLogin'));

                            // update users days since last login to 0
                            this.afs.firestore.collection('users').doc(this.userID).update({
                                daysSinceLogin: 0 });

                            // get and save token
                            this.notificationSetup(this.userID);

                            this.router.navigate(['/tabs/home/']);
                            this.loginForm.reset();
                        } else {
                            this.showToast('Password is incorrect');
                        }
                    });
                });

            } else {
                console.log('Email does not exist');
                this.showToast('Email is incorrect');
                this.userEmail = false;
            }
        });
    }


    logOut(): void {
      this.storage.set('authenticated', 'false');
      this.storage.remove('userCode');
      this.storage.remove('totalDaysPregnant');
      this.storage.remove('weeksPregnant');
      this.storage.remove('daysPregnant');
      this.router.navigateByUrl('login');
    }

    showToast(msg) {
        this.toastCtrl.create({
            message: msg,
            duration: 2000
        }).then(toast => toast.present());
    }
}
