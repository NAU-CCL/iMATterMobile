import {Component, OnInit, Version} from '@angular/core';
import {AnalyticsService, Analytics, Sessions} from 'src/app/services/analyticsService.service';
import {FormGroup, Validators, FormBuilder} from '@angular/forms';
import {LoadingController, AlertController, Platform} from '@ionic/angular';
import {AuthServiceProvider} from '../../../services/user/auth.service';
import {FcmService} from '../../../services/pushNotifications/fcm.service';
import {Router} from '@angular/router';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {Observable} from 'rxjs';
import {ToastController} from '@ionic/angular';

import { Storage } from '@ionic/storage-angular';

import {BnNgIdleService} from 'bn-ng-idle';
import { StorageService } from 'src/app/services/storage/storage.service';

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
    // 2 means user does not have loggin credentials on device or User has autoLogin set to false in settings.
    // 1 means the user has credentials on the device and we will auto log them in.
    public userAutoLoginSetting: number = 3;

    private storage: Storage = null;
    constructor(
        public loadingCtrl: LoadingController,
        public alertCtrl: AlertController,
        private authService: AuthServiceProvider,
        private router: Router,
        private formBuilder: FormBuilder,
        private afs: AngularFirestore,
        private toastCtrl: ToastController,
        private fcm: FcmService,
        private analyticsService: AnalyticsService,
        private platform: Platform,
        private bnIdle: BnNgIdleService,
        private storageService: StorageService,
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

    
        
    }

   async ngOnInit() {
        console.log(`In login page oninit`);
        // check for internet connection
        document.addEventListener( 'offline', () => {
            this.showAlert()
        })
        if( !navigator.onLine ){
            this.showAlert()
        }
    }

    // This is an ionic method called after a view loads AUTOMAGICALLY.
    // Metho called right after page load.
    async ionViewDidEnter() {

        this.storage = await this.storageService.getStorage();
        this.storageEmail = await this.storage.get('email')
        console.log('This is the email stored' );
        console.log(this.storageEmail);

        let autoLoginUser: boolean;
        let isUserAuthenticated: boolean = false;

        // Before we even think about auto logging in the user we need to see if the user is authenticated. If the user is authenticated, their user email and pass
        // is stored on the device, if authen is false, there is not user info on the device and we cannot auto log in the user. A user has attribute true assigned to authen when they
        // log in successfully. A users authenticated property is set to false and all user account data is deleted on logout.

        console.log("Waiting for get('auth') to return");

        // Add await to force the function to synchronously execute before moving onto next lines of code.
        
        isUserAuthenticated = await this.storage.get('authenticated') === 'true';

        console.log(`Got value from await func, is is: ${ isUserAuthenticated } typeof autoLoginUser is ${ typeof( isUserAuthenticated ) }`);


        // If the user is NOT authenticated we cannot auto log them in as not user data exists on the device.
        // Show the login page.
        if( isUserAuthenticated )
        {
            console.log(`Inside main if statement, isUserAuthenticated is: ${ typeof(isUserAuthenticated) }`);

            let userID = this.storage.get('userCode').then( ( userCode ) => {
                console.log("Inside the get user code method gonna be null.")
    
                // Get a document from a collection. .doc() returns a doc reference! This is an offline operation and does not give you access to the actual doc data.
                // Call .get().then(function) on the doc reference to actually retrieve the document as a snapshot.
                // The retrieved document is returned as a document snapshot, which we can then call .get('fieldname') to get the documents field name.
                this.afs.firestore.collection('users').doc( userCode.toString() ).get().then( ( docSnapShot ) => {
                        // See if user selected auto log me in setting in their profile.
                        autoLoginUser = docSnapShot.get('autoLogin');
                        if( autoLoginUser )
                        {
                            // Log in the user automatically if theyre credentials are stored on the device.
                            // This function also changes the value of isUserAlreadyLoggIn which is used to show the login loading animation or NOT.
                            this.autoLoginUser();
                        }
                        else // because autoLoginUser needs to run to show the login page or the login loading animation, we need to manually set the variable to show the login page.
                        {
                            // This var is used in the html template in order to decide whether or not to show the loading animation or the login screen.
                            // If user does not have autoLogin selected then we show the login screen. Num 2 means show login screen. See field declaration for explanation.
                            this.userAutoLoginSetting = 2;
                        }
    
                    }
    
                )} 
            );
        }
        else
        {
            // If the user is not authenticated, we cannot automatically log them in to the app.
            this.userAutoLoginSetting = 2;
        }
    }

    autoLoginUser()
    {
        console.log('STORAGE: ' + this.storage.get('email'));
        this.storage.get('email').then((val) => { // get the users email from phones local storage.
            if (val.toString().length > 1) {
                this.storageEmail = val;
                console.log('VAL: ' + val);
                this.storage.get('authenticated').then((auth) => {
                    if (auth.toString().length > 1) {
                        console.log('AUTH: ' + auth);
                        this.storage.get('password').then((pass) => {
                            if (pass.toString().length > 1) {
                                if (auth === 'true') {
                                    // User is already authenticated, time to validate their saved credentials.
                                    this.userAutoLoginSetting = 1;
                                    this.validateEmailwithPass(val, pass);
                                }
                                else
                                {
                                    // User is not authenticated, show the user the login screen.
                                    this.userAutoLoginSetting = 2;
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

    
    addSession() {
        
        this.analyticsService.addSessionOnAppEnter( );
    }

    // Used on the login page and called when the user clicks the log in button.
    validateUser(loginForm: FormGroup) {
        this.storage.get('email').then((val) => {
            console.log(val)
            // if (val) {
            //     this.email = val.toString();
            //     this.validateEmailwithPass(val, loginForm.value.password);
            // } else {
            this.storage.set('email', loginForm.value.email);
            this.storage.get('email').then((val) => {
            console.log('//////////////////');
            console.log(val)});
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
                // Get a reference to the user with the email saved on the device.
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
                            
                            // IF USER EMAIL AND PASS ON DEVICE MATCH DATABASE, load information into the user object and create a session.

                            // this.storage.set('version', this.device.version);
                            this.storage.set('userCode', this.userID).then( ()=>{
                                this.addSession();
                            });
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

                            // Show loging screen in case this func fails to log user in
                            this.userAutoLoginSetting = 2;
                        }
                    });
                });

            } else {
                console.log('Email does not exist');
                this.showToast('Email is incorrect');
                this.userEmail = false;
                
                // Show loging screen in case this func fails to log user in
                this.userAutoLoginSetting = 2;
            }
        });
    }


    // Delete user information when logging them out.
    logOut(): void {
        this.analyticsService.endSessionOnAppExit();
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

    private showAlert() {
        this.toastCtrl.create({
          cssClass: "error",
          message: "You aren't connected to the internet. Please connect to the Internet and reload the app.",
          position: 'top',
          buttons: [
            {
                side: 'end',
                text: 'Close',
                role: 'cancel'
            }
          ]
        }).then( (toast) => {
        toast.present()});
      }
}
