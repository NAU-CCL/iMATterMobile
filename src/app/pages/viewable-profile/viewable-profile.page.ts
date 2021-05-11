import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Storage} from '@ionic/storage';
import {AngularFirestore} from '@angular/fire/firestore';
import {QuestionService} from '../../services/infoDesk/question.service';
import {DatePipe} from '@angular/common';
import {User, Provider} from '../../services/user/auth.service';

@Component({
    selector: 'app-viewable-profile',
    templateUrl: './viewable-profile.page.html',
    styleUrls: ['./viewable-profile.page.scss'],
})
export class ViewableProfilePage implements OnInit {

    user: User = {
        code: '',
        username: '',
        email: '',
        password: '',
        dueDate: '',
        endRehabDate: '',
        location: 0,
        weeksPregnant: '',
        daysPregnant: '',
        totalDaysPregnant: '',
        cohort: '',
        bio: '',
        securityQ: '',
        securityA: '',
        currentEmotion: '',
        profilePic: '',
        joined: '',
        daysAUser: 0,
        points: 0,
        chatNotif: true,
        learningModNotif: true,
        surveyNotif: true,
        infoDeskNotif: true,
        token: '',
        recentNotifications: [],
        answeredSurveys: [],
        joinedChallenges: [],
        completedChallenges: [],
        codeEntered: true,
        dailyQuote: ''
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
        type: '',
        providerType: ''
    };

    private userProfileID: any;
    public userEmotionIcon: string;
    private currentPost: any;
    private currentCohort: any;
    private currentLoc: any;
    public userType: string;

    public emotionIcons = {
        excited: '🤗',
        happy: '😃',
        loved: '🥰',
        indifferent: '😐',
        overwhelmed: '😩',
        sad: '😢',
        angry: '😡',
    };

    constructor(private afs: AngularFirestore, private activatedRoute: ActivatedRoute, private questionService: QuestionService,
                private router: Router, private storage: Storage, private datePipe: DatePipe) {
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
                        const date = new Date(doc.get('endRehabDate') + 'T12:00:00');
                        this.user.endRehabDate = this.datePipe.transform(date, 'MMMM d, yyyy');;
                        this.user.currentEmotion = doc.get('mood');
                        this.user.profilePic = doc.get('profilePic');
                        this.userEmotionIcon = this.getUserEmotionIcon(this.user.currentEmotion);
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
                                this.provider.providerType = doc.get('providerType');
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

    getUserEmotionIcon(emotion: string) {
        if (emotion === 'excited') {
            return this.emotionIcons.excited;
        } else if (emotion === 'happy') {
            return this.emotionIcons.happy;
        } else if (emotion === 'loved') {
            return this.emotionIcons.loved;
        } else if (emotion === 'indifferent') {
            return this.emotionIcons.indifferent;
        } else if (emotion === 'overwhelmed') {
            return this.emotionIcons.overwhelmed;
        } else if (emotion === 'sad') {
            return this.emotionIcons.sad;
        } else if (emotion === 'angry') {
            return this.emotionIcons.angry;
        }
    }

    goBackToPost() {

        if (this.currentLoc === '/chat/') {
            this.router.navigate(['/chat/', this.currentCohort]);
        } else {
            this.router.navigate(['/forum/forum-thread/', this.currentPost]);
        }
    }
}
