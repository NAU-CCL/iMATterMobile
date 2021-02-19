import {Component, OnInit} from '@angular/core';
import {AuthServiceProvider} from '../../../services/user/auth.service';
import {recovery_emailService, Recovery_email} from '../../../services/recovery.service';
import {AlertController} from '@ionic/angular';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.page.html',
    styleUrls: ['./reset-password.page.scss'],
})

export class ResetPasswordPage implements OnInit {
    constructor(
        private authService: AuthServiceProvider,
        private alertCtrl: AlertController,
        private formBuilder: FormBuilder,
        private router: Router,
        // tslint:disable-next-line:no-shadowed-variable
        private recoveryEmailService: recovery_emailService,
        public recoveryEmail: Recovery_email = {
            id: '',
            code: '',
            email: ''
        }
    ) {
        this.resetPasswordForm = this.formBuilder.group({
            email: [
                '',
                Validators.compose([Validators.required, Validators.email]),
            ],
        });
    }

    public resetPasswordForm: FormGroup;

    ngOnInit() {
    }


    /* resetPassword(resetPasswordForm: FormGroup): void {
       if (!resetPasswordForm.valid) {
         console.log(
             'Form is not valid yet, current value:', resetPasswordForm.value
         );
       } else {
         const email: string = resetPasswordForm.value.email;

         this.authService.resetPassword(email).then(
             async () => {
               const alert = await this.alertCtrl.create({
                 message: 'Check your email for a password reset link',
                 buttons: [
                   {
                     text: 'Ok',
                     role: 'cancel',
                     handler: () => {
                       this.router.navigateByUrl('recovery-code');
                     },
                   },
                 ],
               });
               await alert.present();
             },
             async error => {
               const errorAlert = await this.alertCtrl.create({
                 message: error.message,
                 buttons: [{ text: 'Ok', role: 'cancel' }],
               });
               await errorAlert.present();
             }
         );
       }
       IN THE HTML WITH BUTTON: (click)="resetPassword(resetPasswordForm)"
     }*/

    addRecovery() {
        this.recoveryEmail.code = Math.floor(Math.random() * 1000000000).toString();
        this.recoveryEmail.email = this.resetPasswordForm.value.email;
        console.log(this.recoveryEmail.email);
        this.recoveryEmailService.addRecovery(this.recoveryEmail);
        this.router.navigateByUrl('recovery-code');
    }

}
