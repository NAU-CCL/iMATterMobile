import { Component, OnInit } from '@angular/core';
import { AuthServiceProvider } from '../../../services/user/auth.service';
import { recovery_emailService, Recovery_email } from '../../../services/recovery.service';
import { AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})

export class ResetPasswordPage implements OnInit {
  public resetPasswordForm: FormGroup;
  public code: number;
  public isAvailable: boolean;
  // public checkAvailable: boolean;
  private userEmail: boolean;

  public index: number;
  public recoveryEmail: Recovery_email = {
    id: '',
    code: '',
    email: ''
  };

  constructor(
    private authService: AuthServiceProvider,
    private alertCtrl: AlertController,
    private formBuilder: FormBuilder,
    private router: Router,
    private recoveryEmailService: recovery_emailService,
    private afs: AngularFirestore,
    private toastCtrl: ToastController
  ) {
    this.resetPasswordForm = this.formBuilder.group({
      email: [
        '',
        Validators.compose([Validators.required, Validators.email]),
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

  addRecovery() {

    this.recoveryEmail.email = this.resetPasswordForm.value.email;


    let ref = this.afs.firestore.collection('users');
    ref.where('email', '==', this.recoveryEmail.email)
      .get().then(snapshot => {
        if (snapshot.docs.length > 0) {
          this.userEmail = true;
          const userRef = ref.where('email', '==', this.recoveryEmail.email);
          userRef.get().then((result) => {
            result.forEach(doc => {
              this.index = 0;
              this.isAvailable = false;
              this.code = Math.floor(Math.random() * 1000000000);
              this.recoveryEmail.code = this.code.toString();
              console.log(this.code);
              this.recoveryEmail.email = this.resetPasswordForm.value.email;
              console.log(this.recoveryEmail.email);
              this.recoveryEmailService.addRecovery(this.recoveryEmail);
              this.router.navigateByUrl('recovery-code');
            });
          });

        } else {
          this.userEmail = false;
          this.showToast('Email  is not valid');
        }
      });
  }


  // resetPassword(resetPasswordForm: FormGroup): void {
  //    if (!resetPasswordForm.valid) {
  //      console.log(
  //          'Form is not valid yet, current value:', resetPasswordForm.value
  //      );
  //    } else {
  //      const email: string = resetPasswordForm.value.email;

  //      this.authService.resetPassword(email).then(
  //          async () => {
  //            const alert = await this.alertCtrl.create({
  //              message: 'Check your email for a password reset link',
  //              buttons: [
  //                {
  //                  text: 'Ok',
  //                  role: 'cancel',
  //                  handler: () => {
  //                    this.router.navigateByUrl('recovery-code');
  //                  },
  //                },
  //              ],
  //            });
  //            await alert.present();
  //          },
  //          async error => {
  //            const errorAlert = await this.alertCtrl.create({
  //              message: error.message,
  //              buttons: [{ text: 'Ok', role: 'cancel' }],
  //            });
  //            await errorAlert.present();
  //          }
  //      );
  //    }
  //   //  IN THE HTML WITH BUTTON: (click)="resetPassword(resetPasswordForm)"
  //  }

  // addRecovery() {
  //     this.recoveryEmail.code = Math.floor(Math.random() * 1000000000).toString();
  //     this.recoveryEmail.email = this.resetPasswordForm.value.email;
  //     console.log(this.recoveryEmail.email);
  //     this.recoveryEmailService.addRecovery(this.recoveryEmail);
  //     this.router.navigateByUrl('recovery-code');
  // }

}
