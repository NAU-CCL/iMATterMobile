import { Component, OnInit } from '@angular/core';
import { AnalyticsService, Analytics, Sessions  } from 'src/app/services/analyticsService.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { LoadingController, AlertController } from '@ionic/angular';
import { AuthServiceProvider, User} from '../../../services/user/auth.service';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import {ToastController} from '@ionic/angular';
import { Storage } from '@ionic/storage';
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


  private analyticss : string;
  private sessions : Observable<any>;


    constructor(
        public loadingCtrl: LoadingController,
        public alertCtrl: AlertController,
        private authService: AuthServiceProvider,
        private router: Router,
        private formBuilder: FormBuilder,
        public afs: AngularFirestore,
        private toastCtrl: ToastController,
        private storage: Storage,
        private analyticsService: AnalyticsService
    ) {
        this.loginForm = this.formBuilder.group({
            email: ['',
                Validators.compose([Validators.required, Validators.email])],
            password: [
                '',
                Validators.compose([Validators.required, Validators.minLength(6)]),
            ],
        });
    }

    ngOnInit() {
        this.storage.set('authenticated', 'false');


    }


  addSession(){
  this.storage.get('userCode').then((val) => {
    if(val){
      const ref = this.afs.firestore.collection('users').where('code', '==',val);
      ref.get().then((result)=> {
        result.forEach(doc =>{

          this.session.userID= val;
          this.session.LoginTime = firebase.firestore.FieldValue.serverTimestamp();
          this.analyticsService.addSession(this.session).then(()=> {

          }, err => {
          console.log('trouble adding session');

        });
      });
    });
  }
});
console.log('successful session creation');

}


    validateUser(loginForm: FormGroup) {
        this.email = loginForm.value.email;
        this.password = loginForm.value.password;

        this.afs.firestore.collection('users').where('email', '==', this.email)
            .get().then(snapshot => {
            if (snapshot.docs.length > 0) {
                console.log(('exists'));
                this.userEmail = true;
                const userRef = this.afs.firestore.collection('users').where('email', '==', this.email);
                userRef.get().then((result) => {
                    result.forEach(doc => {
                        this.userID = doc.id;
                        this.userPassword = doc.get('password');

                        if ( this.userPassword === this.password) {
                            this.storage.set('userCode', this.userID);
                            this.storage.set('authenticated', 'true');
                            this.storage.set('username', doc.get('username'));
                            this.storage.set('dueDate', doc.get('dueDate'));
                            this.storage.set('cohort', doc.get('cohort'));

                            this.getCurrentPregnancyStatus(doc.get('dueDate'));
                            console.log(doc.get('dueDate'));
                            this.addSession();


                            this.router.navigate(['/tabs/home/']);
                        } else {
                            this.showToast('Password is incorrect');
                        }

                    });
                });

            } else {
                console.log('Email does not exist');
                this.userEmail = false;
            }
        });
    }

    showToast(msg) {
        this.toastCtrl.create({
            message: msg,
            duration: 2000
        }).then(toast => toast.present());
    }

    getCurrentPregnancyStatus(dueDate) {
        const currentDateString = new Date().toJSON().split('T')[0];
        const currentDate = new Date(currentDateString);
        console.log(currentDate);
        const userDueDate = new Date(dueDate);
        console.log(dueDate);
        console.log(userDueDate);
        const dateDiff = Math.abs(currentDate.getTime() - userDueDate.getTime());
        const diffInDays = Math.ceil(dateDiff / (24 * 3600 * 1000));
        console.log(diffInDays);
        const totalDays = 280 - diffInDays - 1;
        this.storage.set('totalDaysPregnant', totalDays);
        console.log(totalDays);
        const weeksPregnant = Math.floor(totalDays / 7);
        this.storage.set('weeksPregnant', weeksPregnant);
        console.log(weeksPregnant);
        const daysPregnant = totalDays % 7;
        this.storage.set('daysPregnant', daysPregnant);
        console.log(daysPregnant);

        this.storage.get('userCode').then((val) => {
            if (val) {
                this.afs.firestore.collection('users').where('code', '==', val)
                    .get().then(snapshot => {
                    snapshot.forEach(doc => {
                        this.afs.firestore.collection('users')
                            .doc(val).update({weeksPregnant: weeksPregnant});
                    });
                });
            }
        });
    }

}
