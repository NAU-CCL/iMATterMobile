import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { QuestionService } from '../../services/infoDesk/question.service';
import { User, Provider } from '../../services/user/auth.service';

@Component({
  selector: 'app-viewable-profile',
  templateUrl: './viewable-profile.page.html',
  styleUrls: ['./viewable-profile.page.scss'],
})
export class ViewableProfilePage implements OnInit {

  user: User = {
    code: '',
    username: '',
    email:  '',
    password: '',
    dueDate: '',
    location: 0,
    weeksPregnant: '',
    daysPregnant: '',
    totalDaysPregnant: '',
    cohort: '',
    bio:  '',
    securityQ: '',
    securityA: '',
    currentEmotion: '',
    profilePic: '',
    joined: '',
    daysAUser: 0,
    chatNotif: true,
    token: ''
  };

  provider: Provider = {
  code: '',
  username: '',
  nameFirst: '',
  nameLast: '',
  email: '',
  password: '',
  profilePic: '',
  dob: '',
  bio: '',
  type: ''
};

  private userProfileID: any;
  private currentPost: any;
  private currentCohort: any;
  private currentLoc: any;
  private userType: string;

  constructor(private afs: AngularFirestore, private activatedRoute: ActivatedRoute, private questionService: QuestionService,
              private router: Router, private storage: Storage) {
    this.userProfileID = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    this.storage.get('authenticated').then((val) => {
      if (val === 'false') {
        this.router.navigate(['/login/']);
      }
    });

    this.storage.get('currentLoc').then((val) => {
      if (val) {
        this.currentLoc = val;
      }
    });

    if (this.currentLoc === 'chat') {
      this.storage.get('currentCohort').then((val) => {
        if (val) {
          this.currentCohort = val;
        }
      });
    } else {
      this.storage.get('currentPost').then((val) => {
        if (val) {
          this.currentPost = val;
        }
      });
    }

    let ref = this.afs.firestore.collection('users');
    ref.where('code', '==', this.userProfileID)
        .get().then(snapshot => {
      if (snapshot.docs.length > 0) {
        const userRef = ref.where('code', '==', this.userProfileID);
        userRef.get().then((result) => {
          result.forEach(doc => {
            this.userType = 'user';
            this.user.username = doc.get('username');
            console.log(this.user.username);
            this.user.bio = doc.get('bio');
            this.user.cohort = doc.get('cohort');
            this.user.currentEmotion = doc.get('mood');
            this.user.profilePic = doc.get('profilePic');
          });
        });
      } else {
        ref = this.afs.firestore.collection('providers');
        ref.where('code', '==', this.userProfileID)
            .get().then(snap => {
          if (snap.docs.length > 0) {
            const userRef = ref.where('code', '==', this.userProfileID);
            userRef.get().then((result) => {
              result.forEach(doc => {
                this.userType = 'provider';
                this.provider.username = doc.get('username');
                this.provider.bio = doc.get('bio');
                this.provider.profilePic = doc.get('profilePic');
              });
            });
          }
        });
      }
    });
  }
          /*
          let ref = this.afs.firestore.collection('users');
          console.log(this.userProfileID);
          ref.where('code', '==', this.userProfileID)
              .get().then(snapshot => {
            if (snapshot.docs.length > 0) {
              ref.get().then((result) => {
                result.forEach(doc => {
                  this.userType = 'user';
                  this.user.username = doc.get('username');
                  console.log(this.user.username);
                  this.user.weeksPregnant = doc.get('weeksPregnant');
                  this.user.bio = doc.get('bio');
                  this.user.cohort = doc.get('cohort');
                  this.user.currentEmotion = doc.get('mood');
                  this.user.profilePic = doc.get('profilePic');
                });
              });
            } else {
              ref = this.afs.firestore.collection('providers');
              ref.where('code', '==', this.userProfileID)
                  .get().then(snap => {
                if (snap.docs.length > 0) {
                  ref.get().then((result) => {
                    result.forEach(doc => {
                      this.userType = 'provider';
                      this.provider.username = doc.get('username');
                      this.provider.bio = doc.get('bio');
                      this.provider.profilePic = doc.get('profilePic');
                    });
                  });
                }
              });
            }
          });*/

  ionViewWillEnter() {

  }

  goBackToPost() {

    if (this.currentLoc === '/chat/') {
      this.router.navigate(['/chat/', this.currentCohort]);
    } else {
      this.router.navigate(['/forum/forum-thread/', this.currentPost]);
    }
  }
}
