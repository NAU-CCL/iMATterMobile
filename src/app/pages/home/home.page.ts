import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Storage} from '@ionic/storage';
import {AngularFirestore} from '@angular/fire/firestore';
import {ToastController, AlertController} from '@ionic/angular';
import {User} from '../../services/user/auth.service';
import {ChatService, Cohort, Chat} from '../../services/chat/chat-service.service';
import {AnalyticsService, Analytics, Sessions} from 'src/app/services/analyticsService.service';
import * as firebase from 'firebase/app';
import {Observable} from 'rxjs';
import {FireService} from 'src/app/services/survey/fire.service';
import {MoodProviderNotifService, EmotionNotif} from '../../services/mood-provider-notif.service';
import {ChallengeService, Challenge, ChallengeTypes} from '../../services/challenges/challenge-service.service';
import {delay} from 'rxjs/operators';
import {element} from 'protractor';


@Component({
    selector: 'app-tab1',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {

    pregnancyCard = {
        day: '',
        picture: '',
        description: ''
    };

    quoteCard = {
        picture: ''
    };

    cohort: Cohort = {
        name: ''
    };

    chat: Chat = {
        cohort: '',
        username: '',
        userID: '',
        timestamp: '',
        message: '',
        profilePic: '',
        type: '',
        visibility: true,
        count: 0
    };

    user: User = {
        code: '',
        username: '',
        email: '',
        password: '',
        dueDate: '',
        endRehabDate: '',
        location: 0,
        cohort: '',
        weeksPregnant: '',
        daysPregnant: '',
        totalDaysPregnant: '',
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
        codeEntered: true
    };

    emotionNotif: EmotionNotif = {
        userID: '',
        username: '',
        emotionEntered: '',
        viewed: false,
        timestamp: ''
    };

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

    public dropDown: any = [];
    public expandSize;
    public daysInRecovery;
    private userProfileID: any;
    private id: any;
    private weeksPregnant: any;
    private daysPregnant: any;
    private totalDaysPregnant: any;
    private analyticss: string;
    private sessions: Observable<any>;
    public challenges: Observable<Challenge[]>;
    public challengeProgress = {};
    public daysComplete = {};
    public challengeDayComplete: boolean;

    constructor(private activatedRoute: ActivatedRoute, public afs: AngularFirestore,
                private toastCtrl: ToastController,
                private storage: Storage,
                private  router: Router,
                private chatService: ChatService,
                private alertController: AlertController,
                private analyticsService: AnalyticsService,
                private fs: FireService,
                private challengeService: ChallengeService,
                private mpnService: MoodProviderNotifService) {
        this.dropDown = [{expanded: false}];
    }

    ngOnInit() {

        this.storage.get('authenticated').then((val) => {
            if (val === 'false') {
                this.router.navigate(['/login/']);
            }
        });

        this.getRandomQuote();
        /*

        this.storage.get('weeksPregnant').then((val) => {
          if (val) {
            this.weeksPregnant = val;
            console.log(val);

          }
        });

        this.storage.get('daysPregnant').then((val) => {
          if (val >= 0 ) {
            this.daysPregnant = val;
            console.log(val);

          }
        });

        this.storage.get('totalDaysPregnant').then((val) => {
          if (val) {
            this.totalDaysPregnant = val.toString();
            console.log(val);
            const ref = this.afs.firestore.collection('pregnancyUpdates')
                .where('day', '==', this.totalDaysPregnant);
            ref.get().then((result) => {
              result.forEach(doc => {
                this.pregnancyCard.day = doc.get('day');
                this.pregnancyCard.picture = doc.get('picture');
                this.pregnancyCard.description = doc.get('description');
              });
            });
          }
        });*/
    }

    ionViewWillEnter() {
        console.log('ionViewWillEnter()');
        // this.ngOnInit();
        this.addView();
        this.challenges = this.challengeService.getAllChallenges();

        this.userProfileID = this.storage.get('userCode');
        this.storage.get('userCode').then((val) => {
            if (val) {
                this.userProfileID = val;

                const ref = this.afs.firestore.collection('users').where('code', '==', val);
                ref.get().then((result) => {
                    result.forEach(doc => {
                        this.user.username = doc.get('username');
                        this.user.profilePic = doc.get('profilePic');
                        this.user.email = doc.get('email');
                        this.user.dueDate = doc.get('dueDate');
                        // this.user.weeksPregnant = doc.get('weeksPregnant');
                        // this.user.daysPregnant = doc.get('daysPregnant');
                        // this.user.totalDaysPregnant = doc.get('totalDaysPregnant');
                        this.user.endRehabDate = doc.get('endRehabDate');
                        // this.user.password = doc.get('password');
                        this.user.bio = doc.get('bio');
                        this.user.location = doc.get('location');
                        this.user.cohort = doc.get('cohort');
                        this.user.currentEmotion = doc.get('mood');
                        this.user.code = doc.get('code');
                        this.user.joinedChallenges = doc.get('joinedChallenges');
                        console.log(this.user.joinedChallenges);

                        this.daysInRecovery = this.getDaysInRecovery(this.user.endRehabDate);

                        this.user.joinedChallenges.forEach(item => {
                            this.challengeProgress[item.challenge.id] = item.currentDay - 1;
                            this.daysComplete[item.challenge.id] = item.dayComplete;
                            console.log(this.daysComplete);
                        });

                        const pregUpdateRef = this.afs.firestore.collection('pregnancyUpdates')
                            .where('day', '==', this.user.totalDaysPregnant);
                        pregUpdateRef.get().then((res) => {
                            res.forEach(document => {
                                this.pregnancyCard.day = document.get('day');
                                this.pregnancyCard.picture = document.get('picture');
                                this.pregnancyCard.description = document.get('description');
                            });
                        });

                    });
                });
            }
        });

        this.storage.get('userCode').then((val) => {
            if (val) {
                this.userProfileID = val;
                const ref = this.afs.firestore.collection('users').where('code', '==', val);
                ref.get().then((result) => {
                    result.forEach(doc => {
                        this.user.recentNotifications = doc.get('recentNotifications');
                        this.expandSize = (150 + 50 * this.user.recentNotifications.length) + 'px';
                    });
                });
            }
        });
    }

    doRefresh(event) {
        setTimeout(() => {
            this.ionViewWillEnter();
            event.target.complete();
        }, 1000);
    }

    challengeJoined(id): boolean {
        const joined = [];
        this.user.joinedChallenges.forEach(item => {
            joined.push(item.challenge.id);
        });
        return joined.includes(id);
    }

    completeDay(id) {
        const check = document.getElementById(id) as HTMLInputElement;
        console.log(check.checked);
        if (!check.checked) {
            this.areYouSure(id);
        } else {
            this.user.joinedChallenges.forEach(item => {
                if (item.challenge.id === id) {
                    item.dayComplete = !item.dayComplete;
                    this.challengeService.updateJoinedChallenges(this.userProfileID, this.user.joinedChallenges).then(r => console.log(r));
                }
            });
        }
    }

    async getRandomQuote() {
        const quotes: string[] = [];
        const imgs = this.afs.firestore.collection('quotes');
        imgs.get().then((result) => {
            result.forEach(doc => {
                quotes.push(doc.get('picture'));
            });
            const randIndex = Math.floor(Math.random() * Math.floor(quotes.length));
            this.quoteCard.picture = quotes[randIndex];
        });
    }

    getDaysInRecovery(dateString) {
        const currentDateString = new Date().toJSON().split('T')[0];
        const currentDate = new Date(currentDateString);
        const userDate = new Date(dateString);
        const dateDiff = Math.abs(currentDate.getTime() - userDate.getTime());
        return Math.ceil(dateDiff / (24 * 3600 * 1000));
    }

    updateProfileClicks() {
        this.analyticsService.updateProfileClicks(this.session);
        console.log('added profile click');

    }

    updateInfoClicks() {
        this.analyticsService.updateInfoClicks(this.session);
        console.log('added info click');

    }


    updateSurveyClicks() {
        this.analyticsService.updateSurveyClicks(this.session);
        console.log('added survery click');

    }

    addView() {

        // this.analytic.sessionID = this.session.id;
        this.storage.get('userCode').then((val) => {
            if (val) {
                const ref = this.afs.firestore.collection('users').where('code', '==', val);
                ref.get().then((result) => {
                    result.forEach(doc => {
                        this.analytic.page = 'home';
                        this.analytic.userID = val;
                        this.analytic.timestamp = firebase.firestore.FieldValue.serverTimestamp();
                        // this.analytic.sessionID = this.idReference;
                        this.analyticsService.addView(this.analytic).then(() => {
                            console.log('successful added view: home');

                        }, err => {
                            console.log('unsucessful added view: home');

                        });
                    });
                });
            }
        });
    }


    saveEmotion(emotion: string) {
        this.afs.firestore.collection('users').doc(this.userProfileID)
            .update({mood: emotion});

        this.user.currentEmotion = emotion;

        this.chat.cohort = this.user.cohort;
        this.chat.userID = this.userProfileID;
        this.chat.username = this.user.username;
        this.chat.profilePic = this.user.profilePic;
        this.chat.timestamp = firebase.firestore.FieldValue.serverTimestamp();
        this.chat.message = this.chat.username + ' is currently feeling ' + emotion;
        this.chat.type = 'emotion';
        this.chat.visibility = true;

        this.chatService.addChat(this.chat).then(() => {
            this.chat.message = '';
        });

        if (emotion === 'sad' || emotion === 'overwhelmed' || emotion === 'angry') {
            this.presentAlert('Stay Strong!',
                'Remember you have your cohort to support you and health modules available to you! If you need help,' +
                'please go to the Resources page to find help near you.');

            this.emotionNotif.userID = this.userProfileID;
            this.emotionNotif.username = this.user.username;
            this.emotionNotif.emotionEntered = emotion;
            this.emotionNotif.timestamp = firebase.firestore.FieldValue.serverTimestamp();
            this.mpnService.addEmotionNotif(this.emotionNotif);
        }
    }


    async presentAlert(header: string, message: string) {
        const alert = await this.alertController.create({
            header,
            message,
            buttons: ['OK']
        });

        await alert.present();
    }

    async areYouSure(id) {
        const alert = await this.alertController.create({
            header: 'Are you sure?',
            message: '',
            buttons: [
                {
                    text: 'Yes ' + id,
                    handler: () => {
                        alert.dismiss(true);
                        this.checkForComplete(id);

                        if (this.challengeDayComplete) {
                            this.presentAlert('WOW! You finished the challenge!', 'Way to stick with it.');
                        } else {
                            this.presentAlert('Congratulations!', 'Good work on completing the task for today.' +
                                'Check back tomorrow for another challenge.');
                        }
                        this.user.joinedChallenges.forEach(item => {
                            if (item.challenge.id === id) {
                                item.dayComplete = !item.dayComplete;
                                this.challengeService.updateJoinedChallenges(this.userProfileID,
                                    this.user.joinedChallenges).then(r => console.log(r));
                            }
                        });

                        if (this.challengeDayComplete) {
                            this.user.joinedChallenges.forEach(item => {
                                if (item.challenge.id === id) {
                                    item.dateFinished = new Date();
                                    const challenge = {
                                        challenge: id,
                                        dateStarted: item.dateStarted,
                                        dateFinished: item.dateFinished,
                                    };

                                    this.user.completedChallenges.push(challenge);
                                    this.user.joinedChallenges.splice(
                                        this.user.joinedChallenges.indexOf(item),
                                        1
                                    );
                                    console.log(this.user.joinedChallenges);
                                    console.log(this.user.completedChallenges);
                                    this.challengeService.updateJoinedChallenges(this.userProfileID,
                                        this.user.joinedChallenges).then(r => console.log(r));
                                    this.challengeService.updateCompletedChallenges(this.userProfileID,
                                        this.user.completedChallenges).then(r => console.log(r));
                                }
                            });
                        }
                        const card = document.getElementById('card' + id);
                        card.classList.add('ion-hide');

                        return true;
                    }
                }, {
                    text: 'No',
                    handler: () => {
                        alert.dismiss(false);
                        const check = document.getElementById(id) as HTMLInputElement;
                        check.checked = false;
                        return false;
                    }
                }
            ]
        });

        await alert.present();
    }

    async checkForComplete(id) {
        this.user.joinedChallenges.forEach(item => {
            if (item.challenge.id === id) {
                if (item.currentDay === item.challenge.length) {
                    console.log('LAST DAY COMPLETED');
                    this.challengeDayComplete = true;
                } else {
                    this.challengeDayComplete = false;
                }
            }
        });
    }

    expandItem(drop): void {
        if (drop.expanded) {
            drop.expanded = false;
        } else {
            this.dropDown.map(listItem => {
                if (drop == listItem) {
                    listItem.expanded = !listItem.expanded;
                } else {
                    listItem.expanded = false;
                }
                return listItem;
            });
        }
    }

    clearArray() {
        this.user.recentNotifications = [];
        this.fs.updateRecentNot(this.user.code, this.user.recentNotifications);
    }

    // attempts to go to page and highlight the card with the corresponding id
    goToPage(notif) {

        // notifID declared will contain the id of the LM or Survey
        let notifID;

        // depending on the message received, the user will navigate to either Learning Center or Survey
        if (notif.split(',')[0] == 'There is a new survey available') {
            // grab the id and assign it to notifID
            notifID = notif.split(',')[1];

            // first the surveys collection with the id needed will be grabbed
            const dbSurvey = this.afs.firestore.collection('surveys').doc(notifID);

            console.log('SURVEY NOTIF ID: ' + notifID);
            console.log(dbSurvey);

            // if the survey with the corresponding id exists then navigate to the survey page
            // and highlight the correct card. if it doesn't, display a toast telling the user
            // what went wrong
            dbSurvey.get()
                .then((docSnapshot) => {
                    if (docSnapshot.exists) {
                        dbSurvey.onSnapshot((doc) => {
                            console.log('exists');
                            this.router.navigate(['/tabs/home/available/' + notifID]);
                        });
                    } else {
                        console.log('does not exist');
                        this.showToast('Sorry, this survey is no longer available.');
                    }
                });
        } else {
            // grab the id and assign it to notifID
            notifID = notif.split(',')[1];

            // first the LM collection with the id needed will be grabbed
            const dbLearningModules = this.afs.firestore.collection('learningModules').doc(notifID);

            console.log('LM NOTIF ID: ' + notifID);

            console.log(dbLearningModules);

            // if the LM with the corresponding id exists then navigate to the Learning Center
            // and highlight the correct card. if it doesn't, display a toast telling the user
            // what went wrong
            dbLearningModules.get()
                .then((docSnapshot) => {
                    if (docSnapshot.exists) {
                        dbLearningModules.onSnapshot((doc) => {
                            console.log('exists');
                            this.router.navigate(['/tabs/home/learning-center/' + notifID]);
                        });
                    } else {
                        console.log('does not exist');
                        this.showToast('Sorry, this learning module is no longer available.');
                    }
                });
        }
    }

    refreshList() {
        const ref = this.afs.firestore.collection('users').doc(this.user.code);
        ref.get().then((result) => {
            // result.forEach(doc => {
            this.user.recentNotifications = result.get('recentNotifications');
            this.expandSize = (150 + 50 * this.user.recentNotifications.length) + 'px';
            // });
        });
    }

    showToast(msg: string) {
        this.toastCtrl.create({
            message: msg,
            duration: 2000
        }).then(toast => toast.present());
    }

    toggleDarkTheme() {
        const icon = (document.getElementById('darkMode') as HTMLInputElement);
        if (icon.name === 'moon') {
            icon.name = 'sunny';
        } else {
            icon.name = 'moon';
        }
        document.body.classList.toggle('dark');
    }
}
