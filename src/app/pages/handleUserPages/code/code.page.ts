import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthServiceProvider } from '../../../services/user/auth.service';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';


@Component({
  selector: 'app-code',
  templateUrl: './code.page.html',
  styleUrls: ['./code.page.scss'],
})
export class CodePage implements OnInit {
  public codeForm: FormGroup;
  public loading: HTMLIonLoadingElement;
  public code: any;
  public codeValidated: boolean;

  constructor(
      private loadingCtrl: LoadingController,
      private alertCtrl: AlertController,
      private authService: AuthServiceProvider,
      private router: Router,
      private formBuilder: FormBuilder,
      private afs: AngularFirestore,
      private toastCtrl: ToastController,
  ) {
    this.codeForm = this.formBuilder.group({
      code: ['',
        Validators.compose([Validators.required])],
    });
  }

  ngOnInit() {
  }

  validateCode(code: string) {
    const docRef = this.afs.firestore.collection('users').doc(code);
    docRef.get().then((docData) => {
      if (docData.exists) {
        console.log('Exists');
        this.codeValidated = true;
        this.router.navigate(['/signup/', code ]);
      } else {
        console.log('No such document!');
        this.showToast('Code does not exist');
        this.codeValidated = false;
      }
    }).catch((err) => {
      console.log('Error getting document', err);
    });
  }

  showToast(msg) {
    this.toastCtrl.create({
      message: msg,
      duration: 2000
    }).then(toast => toast.present());
  }
}
