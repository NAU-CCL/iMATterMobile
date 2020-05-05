import { Component, OnInit } from '@angular/core';

import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { LoadingController, AlertController } from '@ionic/angular';
import { AuthServiceProvider, User} from '../../../services/user/auth.service';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import {ToastController} from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { ProfileService } from '../../../services/user/profile.service';

@Component({
  selector: 'app-recovery-code',
  templateUrl: './recovery-code.page.html',
  styleUrls: ['./recovery-code.page.scss'],
})
export class RecoveryCodePage implements OnInit {
	public loginForm: FormGroup;
    public loading: HTMLIonLoadingElement;
    private email: string;
    private password: string;
    private userID: string;
    private userEmail: boolean;
    private userPassword: string;
	private recoveryCode: string;
	private theCode: string;
	private wantedUserID: string;
	private recoveryPassword: string;



  public enterCodeForm: FormGroup;
  constructor(
      public loadingCtrl: LoadingController,
        public alertCtrl: AlertController,
        private authService: AuthServiceProvider,
        private router: Router,
        private formBuilder: FormBuilder,
        public afs: AngularFirestore,
        private toastCtrl: ToastController,
        private storage: Storage,
		private profileService: ProfileService
  ) {
    this.enterCodeForm = this.formBuilder.group({
      recoveryCode: [
        '',
        Validators.compose([Validators.required]),
      ],
	  recoveryPassword: [
        '',
        Validators.compose([Validators.required, Validators.minLength(8)])
      ],
    });
  }

  ngOnInit() {
  }

  showToast(msg) {
        this.toastCtrl.create({
            message: msg,
            duration: 2000
        }).then(toast => toast.present());
    }

  validateUser(enterCodeForm: FormGroup) {
        this.recoveryCode = enterCodeForm.value.recoveryCode;
		this.recoveryPassword = enterCodeForm.value.recoveryPassword;

        var recoveryEmail;
		var theCode;
		//const newPassword: string = this.recoveryPassword;
		let newPassword = this.enterCodeForm.controls['recoveryPassword'].value;
        this.afs.firestore.collection('recovery_email').where('code', '==', this.recoveryCode)
            .get().then(snapshot => {
            if (snapshot.docs.length > 0) {
				const recoveryRef = this.afs.firestore.collection('recovery_email');
				recoveryRef.get().then((result) => {
                    result.forEach(doc => {
                        this.userID = doc.id;
                        this.theCode = doc.get('code');
                        if ( this.theCode === this.recoveryCode) {
                            recoveryEmail = doc.get('email');
							this.afs.firestore.collection('recovery_email').doc(doc.id).update({
								code: "",
								email: ""
							});
                        } else {
                        }
                    });
                });

                const userRef = this.afs.firestore.collection('users');
                userRef.get().then((result) => {
                    result.forEach(doc => {
                        this.userID = doc.id;
                        this.userEmail = doc.get('email');
						this.password = doc.get('password');

                        if ( this.userEmail === recoveryEmail) {
							this.wantedUserID = this.userID;
							console.log(newPassword);
							this.afs.firestore.collection('users').doc(this.wantedUserID).update({
								password: newPassword
							});
              this.showToast('Password has been changed!')
							this.router.navigate(['/login/']);
                        } else {
                        }
                    });
                });
            } else {
                console.log('Email does not exist');
                this.userEmail = false;
            }
        });
    }



}
