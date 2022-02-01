import {Component, OnInit, Version} from '@angular/core';
import {AnalyticsService, Analytics, Sessions} from 'src/app/services/analyticsService.service';
import {FormGroup, Validators, FormBuilder} from '@angular/forms';
import {LoadingController, AlertController, Platform} from '@ionic/angular';
import {AuthServiceProvider} from '../../../services/user/auth.service';
import {FcmService} from '../../../services/pushNotifications/fcm.service';
import {Router} from '@angular/router';
import {AngularFirestore} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {ToastController} from '@ionic/angular';
import {Storage} from '@ionic/storage';

import {BnNgIdleService} from 'bn-ng-idle';
import {Device} from '@ionic-native/device';

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
    private authUserEmailString: string;

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


    public analyticss: string;
    public sessions: Observable<any>;
    public showEmailBox: boolean;
    public storageEmail: string;
    public imageCollectionReference;
    public loadingGifURL: string = '../../../../assets/loadingIcon.gif';  

    // 3 means we dont know if the user is already logged into the app or not, we must wait for our function
    // to check if the user has credential in local storage. Show white screen while app checks for previous login.
    public isUserAlreadyLoggedIn: number = 3;

    

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
        // private device: Device
    ) {
        this.showEmailBox = true;

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

    }

    // This is an ionic method called after a view loads AUTOMAGICALLY.
    // Commenting this out to implement user choice to automatically login.
    ionViewDidEnter() {
        console.log('STORAGE: ' + this.storage.get('email'));
        this.storage.get('email').then((val) => {
            if (val.toString().length > 1) {
                this.storageEmail = val;
                console.log('VAL: ' + val);
                this.storage.get('authenticated').then((auth) => {
                    if (auth.toString().length > 1) {
                        console.log('AUTH: ' + auth);
                        this.storage.get('password').then((pass) => {
                            if (pass.toString().length > 1) {
                                if (auth === 'true') {
                                    // User is already logged in.
                                    this.isUserAlreadyLoggedIn = 1;
                                    this.validateEmailwithPass(val, pass);
                                }
                                else
                                {
                                    // User is not already logged in
                                    this.isUserAlreadyLoggedIn = 2;
                                }
                            }
                        });
                    }
                });
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

                        this.analyticsService.addSession(this.session).then(() => {
                            console.log('successful session creation');

                        }, err => {
                            console.log('trouble adding session');

                        });
                    });
                });
            }
        });


    }

    // Used on the login page and called when the user clicks the log in button.
    validateUser(loginForm: FormGroup) {
        this.storage.get('email').then((val) => {
            // if (val) {
            //     this.email = val.toString();
            //     this.validateEmailwithPass(val, loginForm.value.password);
            // } else {
            this.storage.set('email', loginForm.value.email);
            this.validateEmailwithPass(loginForm.value.email, loginForm.value.password);
            // }
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
                        if (this.userPassword === pass) {
                            if (this.platform.is('android')) {
                                this.storage.set('platform', 'android');
                            } else if (this.platform.is('ios')) {
                                this.storage.set('platform', 'ios');
                            }

                            // this.storage.set('version', this.device.version);
                            this.storage.set('userCode', this.userID);
                            this.addSession();
                            this.storage.set('authenticated', 'true');
                            this.storage.set('password', this.userPassword);
                            this.storage.set('username', doc.get('username'));
                            // this.storage.set('dueDate', doc.get('dueDate'));
                            this.storage.set('endRehabDate', doc.get('endRehabDate'));
                            this.storage.set('cohort', doc.get('cohort'));
                            // this.storage.set('totalDaysPregnant', doc.get('totalDays'));
                            // this.storage.set('weeksPregnant', doc.get('weeksPregnant'));
                            // this.storage.set('daysPregnant', doc.get('daysPregnant'));
                            this.storage.set('totalDaysRecovery', doc.get('totalDays'));
                            this.storage.set('weeksRecovery', doc.get('weeksPregnant'));
                            this.storage.set('daysRecovery', doc.get('daysPregnant'));
                            this.storage.set('daysSinceLogin', doc.get('daysSinceLogin'));

                            // update users days since last login to 0
                            this.afs.firestore.collection('users').doc(this.userID).update({
                                daysSinceLogin: 0
                            });

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
        this.storage.remove('email');
        this.storage.remove('password');
        // this.storage.remove('totalDaysPregnant');
        // this.storage.remove('weeksPregnant');
        // this.storage.remove('daysPregnant');
        this.storage.remove('totalDaysRecovery');
        this.storage.remove('weeksRecovery');
        this.storage.remove('daysRecovery');
        this.router.navigateByUrl('login');
    }

    showToast(msg) {
        this.toastCtrl.create({
            message: msg,
            duration: 2000
        }).then(toast => toast.present());
    }
}
