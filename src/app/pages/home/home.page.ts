import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { ToastController, AlertController } from '@ionic/angular';
import { User } from '../../services/user/auth.service';
import { ChatService, Cohort, Chat } from '../../services/chat/chat-service.service';
import { AnalyticsService, Analytics, Sessions } from 'src/app/services/analyticsService.service';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { FireService } from 'src/app/services/survey/fire.service';
import { MoodProviderNotifService, EmotionNotif } from '../../services/mood-provider-notif.service';
import { ChallengeService, Challenge, ChallengeTypes } from '../../services/challenges/challenge-service.service';
import { QuoteService, Quote } from '../../services/homeQuote.service';
import { delay } from 'rxjs/operators';
import { element } from 'protractor';
import { SurveyService, Survey } from 'src/app/services/survey/survey.service';
import { DatePipe } from '@angular/common';
import { ProfileService } from 'src/app/services/user/profile.service';
import { consoleTestResultHandler } from 'tslint/lib/test';


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
        codeEntered: true,
        availableSurveys: [],
        dailyQuote: '',
        autoLogin: false,
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
    private analyticss: string;
    private sessions: Observable<any>;
    public challenges: Observable<Challenge[]>;
    public surveys: Observable<Survey[]>;
    public challengeProgress = {};
    public daysComplete = {};
    public challengeDayComplete: boolean;
    public showDailyQuote: boolean;
    public surveyComplete;
    public userSurveys = [];
    public totalSurveys: number = 0;
    public collpaseChallenges = false;
    public collapseSurveys = true;
    public emotionHidden = false;
    public numActiveChallenges = 0;

    public defaultChallengeCover = "https://firebasestorage.googleapis.com/v0/b/imatter-nau.appspot.com/o/ChallengeImages%2FdefaultChallenge_640x640.png?alt=media&token=f80549df-a0bc-42f2-b487-555fd059f719";

    constructor(private activatedRoute: ActivatedRoute, public afs: AngularFirestore,
        private toastCtrl: ToastController,
        private storage: Storage,
        private router: Router,
        private chatService: ChatService,
        private alertController: AlertController,
        private analyticsService: AnalyticsService,
        private fs: FireService,
        private challengeService: ChallengeService,
        private mpnService: MoodProviderNotifService,
        private quoteService: QuoteService,
        private surveyService: SurveyService,
        private userService: ProfileService,
        private datepipe: DatePipe) {
        this.dropDown = [{ expanded: false }];
    }

    ngOnInit() {

        this.storage.get('authenticated').then((val) => {
            if (val === 'false') {
                this.router.navigate(['/login/']);
            }
        });


        // document.cookie = `accessed=${new Date()};`

        let lastAccessed: any;
        let today = new Date();

        let cookies = document.cookie.split(';');
        let cookie: string;

        for (let i = 0; i < cookies.length; i++) {
            cookie = cookies[i].replace(/^\s+/g, '');
            if (cookie.indexOf('accessed') == 0) {
                lastAccessed = new Date(cookie.substring("accessed".length, cookie.length).replace('=', ''));
                console.log(new Date(lastAccessed.setDate(lastAccessed.getDate() + 1)));
            }
        }
        if (lastAccessed === undefined) {
            console.log("the cookie expired");
            this.emotionHidden = false;
            document.cookie = `accessed=${new Date()};`
        }
        else if (today > new Date(lastAccessed.setDate(lastAccessed.getDate() + 1))) {
            this.emotionHidden = false;
            console.log("it has been 24 hours, reset the date");
            document.cookie = `accessed=${new Date()};`
        } else {
            this.emotionHidden = true;
            console.log("it has not been 24 hours");
        }
        console.log(this.showDailyQuote);
    }

    ionViewWillEnter() {
        console.log('ionViewWillEnter()');

        // Get all surveys from surveys-v2 collection
        this.surveys = this.surveyService.getSurveys();

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
                        this.user.dailyQuote = doc.get('dailyQuote');
                        this.user.joinedChallenges = doc.get('joinedChallenges');
                        this.user.answeredSurveys = doc.get('answeredSurveys');
                        this.user.availableSurveys = doc.get('availableSurveys');
                        this.updateSurveys();

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

        const ref = this.afs.firestore.collection('homeQuote');
        ref.get().then((result) => {
            result.forEach(doc => {
                this.quoteCard.picture = doc.get('quote');
            })
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

    // async getRandomQuote() {
    //     const quotes: string[] = [];
    //     const imgs = this.afs.firestore.collection('quotes');
    //     imgs.get().then((result) => {
    //         result.forEach(doc => {
    //             quotes.push(doc.get('picture'));
    //         });
    //         const randIndex = Math.floor(Math.random() * Math.floor(quotes.length));
    //         this.quoteCard.picture = quotes[randIndex];
    //     });
    // }

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

        console.log(emotion);

        if (emotion != this.user.currentEmotion) {
            this.chatService.addChat(this.chat).then(() => {
                this.chat.message = '';
            });
        }

        this.afs.firestore.collection('users').doc(this.userProfileID)
            .update({ mood: emotion });

        this.user.currentEmotion = emotion;

        this.chat.cohort = this.user.cohort;
        this.chat.userID = this.userProfileID;
        this.chat.username = this.user.username;
        this.chat.profilePic = this.user.profilePic;
        this.chat.timestamp = firebase.firestore.FieldValue.serverTimestamp();
        this.chat.message = this.chat.username + ' is currently feeling ' + emotion;
        this.chat.type = 'emotion';
        this.chat.visibility = true;


        if (emotion === 'stressed') {
            this.presentAlert('Stressed: Stay Strong!',
            `Remember you have a group of peers who care about you and try a challenge to keep moving forward with change. Take a deep breath to ground yourself. 
             Have faith that you'll get through it. If you need help, visit the resources page to find places nearby or hotlines you can call.`);
        } else if (emotion == 'happy') {
            this.presentAlert('Happy: Fantastic!',
                'Glad to hear you are doing well! Positive emotions can help you sieze the day and find new opportunities.')
        } else if (emotion == 'loved') {
            this.presentAlert('Loved: Feeling loved is a great feeling!',
                'Surrounding yourself with those who support and love you will help you during recovery.')
        } else if (emotion == 'ok') {
            this.presentAlert('Ok: It\'s okay to have off days.',
                'Keep going strong, think of ways to make tomorrow a better day!')
        } else if (emotion == 'sad') {
            this.presentAlert('Sad: Your feelings are valid.',
                'You aren’t being too sensitive. You aren’t being too dramatic. You are hurting and that is okay. If you need additional support please reach out to someone who supports you or visit the Resource Locations page.');
        } else if (emotion == 'angry') {
            this.presentAlert('Angry: Stay strong!', ' Anger is a normal reaction as your body is recovering and healing from substance use. When experiencing anger take a step back and assess the situation. Take some time to reflect and practice calming techniques. It is important to acknowledge when you feel this way and simply talking about it could help you overcome it.');
        } else if (emotion == 'lonely') {
            this.presentAlert('Lonely: Stay strong!', 'Feeling lonely can occur even when you\'re not alone. While starting your recovery process it is easy to feel isolated. Creating a strong sober network of like minded people can help discourage loneliness. If you want additional support, there is a chat available in the app for you to reach out and talk to others in similar situations.');
        } else if (emotion == 'tired') {
            this.presentAlert('Tired: That\'s okay!', `With all the demands of life it's easy to feel exhausted and it can be difficult to find time to rest. Proper rest is the foundation for clear thoughts, energy, and coping skills. Try participating in ways to relax your mind like meditation, listening to music, or taking a nap to increase your energy.`);
        }

        this.emotionNotif.userID = this.userProfileID;
        this.emotionNotif.username = this.user.username;
        this.emotionNotif.emotionEntered = emotion;
        this.emotionNotif.timestamp = firebase.firestore.FieldValue.serverTimestamp();
        this.mpnService.addEmotionNotif(this.emotionNotif);
        this.surveys.forEach(item => {
            item.forEach(survey => {
                // Iterate through all surveys in system. If the survey is an emotion triggered survey, then check to see if the users
                // current emotion corresponds to the surveys emotion trigger, if the users emotion corresponds to the survey,
                // push the survey onto the users available survey array.
                if (survey.type == 'Emotion Triggered') {
                    if (survey.characteristics['emotion'] == this.user.currentEmotion) {
                        /*
                        this.user.availableSurveys.push(survey.id);
                        this.afs.firestore.collection('users').doc(this.userProfileID)
                            .update({ availableSurveys: this.user.availableSurveys });
                        console.log(this.user.availableSurveys);
                        */
                    }
                }
            });
        });
        if (!this.emotionHidden) {
            this.emotionHidden = true;
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
                    text: 'Yes',
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

    // Iterate through all surveys in the db and append any survey ids to the user document if the user has not 
    // already completed the survey before. We do not remove survey ids from the user document even if the user has already completed the survey.
    updateSurveys() {
        this.totalSurveys = 0;
        // String array of survey ids representing surveys available to the user.
        const currentSurveys = this.user.availableSurveys;
        this.surveys.forEach(surveyArray => {
            
            // Each survey element within surveyArray represents a generally avaialble survey. Not a survey assigned to the user but
            // simply a survey that could be assigned to the user.
            surveyArray.forEach(survey => {

                //console.log(`Survey from array is ${JSON.stringify(survey)}`);

                // If the currentSurvey array contains the id of the current survey then increase the user total survey count because
                // this survey belongs to the user.
                if(currentSurveys.includes(survey['id']))
                {
                    this.totalSurveys++;
                }

                this.checkComplete(survey);
                console.log(this.surveyComplete);

                if (!this.surveyComplete) {
                    
                    if (survey['type'] == 'Days After Joining') {
                        var characteristics = survey['characteristics'];
                        if (this.user['daysAUser'] >= characteristics['daysAfterJoining']) {
                            if (!currentSurveys.includes(survey['id'])) {
                                currentSurveys.push(survey['id']);
                            }
                        }
                    } else if (survey['type'] == 'Repeating') {
                        // check if repeating survey already complete

                        var weekdays = new Array(
                            "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"
                        );
                        var characteristics = survey['characteristics'];
                        var date = new Date();
                        // Current day of week.
                        var dayOfWeek = weekdays[date.getDay()];
                        // Current day of month.
                        var dayOfMonth = date.getDate();
                        if (characteristics['repeatEvery']) {
                            // if the survey is supposed to repeat weekly, hasnt been completed today, and today is the day the survey is set
                            // to show, add the survey to the users array of available surveys. WILL LIKELY NOT WORK if user
                            // does not open app on the day the survey is set to repeat on.
                            if (characteristics['repeatEvery'] == 'weekly' && dayOfWeek == characteristics['display']) {
                                if (!currentSurveys.includes(survey['id'])) {
                                    currentSurveys.push(survey['id']);
                                }
                            } else if (characteristics['repeatEvery'] == 'monthy' && dayOfMonth == characteristics['display']) {
                                if (!currentSurveys.includes(survey['id'])) {
                                    currentSurveys.push(survey['id']);
                                }
                            } else if (characteristics['repeatEvery'] == 'daily') {
                                if (!currentSurveys.includes(survey['id'])) {
                                    currentSurveys.push(survey['id']);
                                }
                            }
                        }
                    }
                }
                // If the user survey was complete, do nothing and go to the next survey in the array. 
                else {
                    this.surveyComplete = false;
                }

                this.userSurveys = currentSurveys;
                console.log("User surveys: " + this.userSurveys);
                this.userService.updateAvailableSurveys(currentSurveys, this.user['code']);

            });
            
        });

    }

    checkComplete(survey) {
        const surveyID = survey['id'];
        const today = new Date();
        const todayString = this.datepipe.transform(today, 'y-MM-dd');
        this.user.answeredSurveys.forEach(completedSurvey => {
            // If the user completed the repeating survey today, it is counted as complete.
            if (survey['type'] === 'Repeating') {
                if (completedSurvey['survey'] === surveyID && todayString === completedSurvey['date']) {
                    this.surveyComplete = true;
                }
            } else {
                // If the user has completed the survey set the variable to true.
                if (completedSurvey['survey'] === surveyID) {
                    this.surveyComplete = true;
                }
            }
        });
    }

    answerSurvey(survey: Survey) {
        let submitData;
        submitData = survey.id + ':' + this.user['daysAUser'];
        this.router.navigate(['/tabs/home/available/answer/' + submitData]);
    }

}
