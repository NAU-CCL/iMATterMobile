import { Component, OnInit } from '@angular/core';
import { AuthServiceProvider, User } from '../../../services/user/auth.service';
import { LoadingController, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { storage } from 'firebase';
import 'firebase/storage';
import * as firebase from 'firebase/app';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  public signupForm: FormGroup;
  public loading: any;
  private id: any;
  private readMore: boolean;
  private allPicURLs: any;
  private picURL: any;
  private showImages: boolean;
  private dueMonth: string;
  private securityQuestion: string;
  private securityAnswer: string;

  constructor(
      private authService: AuthServiceProvider,
      private loadingCtrl: LoadingController,
      private alertCtrl: AlertController,
      private formBuilder: FormBuilder,
      private activatedRoute: ActivatedRoute,
      private router: Router,
      private ionicStorage: Storage,
  ) {
    const fbstorage = firebase.storage();
    const storageRef = fbstorage.ref('/ProfileImages');
    this.allPicURLs = ['https://firebasestorage.googleapis.com/v0/b/techdemofirebase.appspot.com/o/ProfileImages%2Fauto.png?alt=media&token=e5601f32-30f8-4b38-9a2c-ff2d7e6ad59a',
      'https://firebasestorage.googleapis.com/v0/b/techdemofirebase.appspot.com/o/ProfileImages%2Fbabyfeet.png?alt=media&token=8d49bc52-416a-453b-b8a2-5d539451e107',
      'https://firebasestorage.googleapis.com/v0/b/techdemofirebase.appspot.com/o/ProfileImages%2Fbird.png?alt=media&token=b5fd7b2f-e144-4882-b0d4-ec1cee437a1c',
      'https://firebasestorage.googleapis.com/v0/b/techdemofirebase.appspot.com/o/ProfileImages%2Fbutterfly.png?alt=media&token=48df652b-f133-46b2-9d56-2102cf473c11',
      'https://firebasestorage.googleapis.com/v0/b/techdemofirebase.appspot.com/o/ProfileImages%2Fheart.png?alt=media&token=351f8425-190b-4158-91ac-2bf282051d38',
      'https://firebasestorage.googleapis.com/v0/b/techdemofirebase.appspot.com/o/ProfileImages%2Fpeacock.png?alt=media&token=27ed19f3-3a01-464d-843d-7cfca96e0281',
      'https://firebasestorage.googleapis.com/v0/b/techdemofirebase.appspot.com/o/ProfileImages%2Fpurpleflower.png?alt=media&token=f863d5b3-0d92-4ce0-b1b4-ac643f7c3728',
      'https://firebasestorage.googleapis.com/v0/b/techdemofirebase.appspot.com/o/ProfileImages%2Fredflower.png?alt=media&token=36754216-f5cf-4a38-967a-f024fb60cce7',
    ];

    this.picURL = 'https://firebasestorage.googleapis.com/v0/b/techdemofirebase.appspot.com/o/ProfileImages%2Fauto.png?alt=media&token=e5601f32-30f8-4b38-9a2c-ff2d7e6ad59a';

    this.signupForm = this.formBuilder.group({
      email: [
        '',
        Validators.compose([Validators.required, Validators.email]),
      ],
      password: [
        '',
        Validators.compose([Validators.minLength(6), Validators.required]),
      ],
      username: [
        '',
        Validators.compose([Validators.required, Validators.maxLength(21)]),
      ],
      expectedMonth: [
        '',
        Validators.compose([Validators.required]),
      ],
      weeksPregnant: [
        '',
        Validators.compose([Validators.required, Validators.pattern('^0*([0-9]|[1-3][0-9]|40)$')]),
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
        Validators.compose([Validators.nullValidator, Validators.maxLength(300)]),
      ],
      securityA: [
        '',
        Validators.compose([Validators.nullValidator, Validators.maxLength(300)]),
      ],
    });
  }

  user: User = {
    code: '',
    username: '',
    email:  '',
    password: '',
    dueMonth: '',
    weeksPregnant: 0,
    location: 0,
    cohort: '',
    bio:  '',
    securityQ: '',
    securityA: '',
    currentEmotion: '',
    profilePic: ''
  };

  ngOnInit() {}

  ionViewWillEnter() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }

  async signupUser(signupForm: FormGroup): Promise<void> {
    if (!signupForm.valid) {
      console.log(
          'Need to complete the form, current value: ', signupForm.value
      );
    } else {
      const email: string = signupForm.value.email;
      const password: string = signupForm.value.password;
      const username: string = signupForm.value.username;
      const dueMonth: string = this.dueMonth;
      const securityQ: string = this.securityQuestion;
      const securityA: string = signupForm.value.securityA;
      const weeksPregnant: number = signupForm.value.weeksPregnant;
      const location: number = signupForm.value.location;
      const bio: string = signupForm.value.bio;

      this.user.code = this.id;
      this.user.username = username;
      this.user.email =  email;
      this.user.password = password;
      this.user.dueMonth = dueMonth;
      this.user.weeksPregnant = weeksPregnant;
      this.user.location = location;
      this.user.cohort = dueMonth;
      this.user.bio = bio;
      this.user.profilePic = this.picURL;
      this.user.securityQ = securityQ;
      this.user.securityA = securityA;


      this.authService.signupUser(this.user, email, password, username, dueMonth,
          location, weeksPregnant, bio, this.user.cohort).then(
          () => {
            this.loading.dismiss().then(() => {
              // this.ionicStorage.set('userCode', this.user.code);
              this.router.navigate(['/login' ]);
            });
          },
          error => {
            this.loading.dismiss().then(async () => {
              const alert = await this.alertCtrl.create({
                message: error.message,
                buttons: [{ text: 'Ok', role: 'cancel' }],
              });
              await alert.present();
            });
          }
      );
      this.loading = await this.loadingCtrl.create();
      await this.loading.present();
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
}
