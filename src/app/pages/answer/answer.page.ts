import { Component, OnInit } from '@angular/core';
import { SurveyService, Survey } from 'src/app/services/survey/survey.service';
import { ActivatedRoute, Router } from '@angular/router';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { ProfileService } from 'src/app/services/user/profile.service';
import { Storage } from '@ionic/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { ModalController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-answer',
    templateUrl: './answer.page.html',
    styleUrls: ['./answer.page.scss'],
})
export class AnswerPage implements OnInit {

    // Survey object and its fields
    survey: Survey = {
        type: '',
        description: '',
        title: '',
        link: '',
        points: 0,
        importance: '',
        characteristics: []
    };

    // number of points the user currently has
    userPoints;

    // user's unique code for identification
    userCode;

    // survey id and interval is taking
    surveyData;

    // current user's taken surveys
    userSurveysTaken;

    daysAUser;

    id;
    availableSurveys = [];

    constructor(private activatedRoute: ActivatedRoute,
        private surveyService: SurveyService,
        private browser: InAppBrowser,
        private router: Router,
        private profile: ProfileService,
        private storage: Storage,
        private afs: AngularFirestore,
        private modalController: ModalController,
        public alertController: AlertController,
        public datepipe: DatePipe,
    ) {
    }

    ngOnInit() {
        // if the user is not authenticated, sends the user to login page
        this.storage.get('authenticated').then((val) => {
            if (val === 'false') {
                this.router.navigate(['/login/']);
            }
        });

        // surveyData is initialized to the id that will be taken from the available page
        this.surveyData = this.activatedRoute.snapshot.paramMap.get('id');

        // survey id is taken
        this.id = this.surveyData.split(':')[0];

        // if the id exists, assign the survey object to the survey for which the id belongs to
        if (this.id) {
            this.surveyService.getSurvey(this.id).subscribe(survey => {
                this.survey = survey;
            });
        }

        // using the current user's unique code, obtain the user's points, code, and taken surveys
        this.storage.get('userCode').then((val) => {
            if (val) {
                const ref = this.afs.firestore.collection('users').where('code', '==', val);
                ref.get().then((result) => {
                    result.forEach(doc => {
                        this.userPoints = doc.get('points');
                        this.userCode = doc.get('code');
                        this.userSurveysTaken = doc.get('answeredSurveys');
                        this.availableSurveys = doc.get('availableSurveys');
                        this.daysAUser = doc.get('daysAUser');
                    });
                });
            }
        });
        console.log('SURVEY ID = ' + this.id);

    }

    // opens survey link
    openPage(url: string) {
        // option to hide survey url and change toolbar color
        const options: InAppBrowserOptions = {
            hideurlbar: 'yes',
            toolbarcolor: '#ffffff',
        };

        // open the browser inside of the app, using the url, and the options
        const page = this.browser.create(url, `_blank`, options);

        // When the user exits the survey page show them a message
        page.on('exit').subscribe(event => {

            // this.showMessage()
            this.presentAlert();

        });
    }

    // submits survey
    submit() {
        console.log('SUBMIT');
        // boolean to check if current survey is inluded in the userSurveysTaken
        let includes = false;
        let today = new Date()

        // if the userSurveysTaken is not empty or it does not include the current survey
        // then simply add it to the array with the current survey interval
        // and update the user's userSurveysTaken
        let surveyTaken = {
            survey: this.id,
            date: this.datepipe.transform(today, 'y-MM-dd'),
            time: this.datepipe.transform(today, 'hh:mm a'),
            days: this.daysAUser
        };
        console.log(surveyTaken);

        this.userSurveysTaken.push(surveyTaken);
        this.availableSurveys.splice(this.availableSurveys.indexOf(this.id), 1);
        console.log(this.userSurveysTaken);
        this.surveyService.updateAnsweredSurveys(this.userCode, this.userSurveysTaken, this.availableSurveys);

        // then increase the user's current points by the amount that the current
        // survey is worth, then navigate back to the home page
        const newPointValue = this.userPoints + this.survey.points;
        this.profile.editRewardPoints(newPointValue, this.userCode);
        this.router.navigateByUrl('/tabs/home');
    }

    // determines if the survey is completed
    isComplete() {
        if (this.surveyData.split(':')[1] === 'completed') {
            return true;
        }

        return false;
    }

    // message that is presented after completing the survey
    async presentAlert() {
        const alert = await this.alertController.create({
            header: 'You Completed The Survey',
            subHeader: 'Thank You',
            message: 'Thanks for taking the Survey, your input is really appreciated.',
            buttons: [{
                text: 'OK',
                handler: () => {
                    this.submit();
                }
            }
            ]
        });

        await alert.present();
    }
}
