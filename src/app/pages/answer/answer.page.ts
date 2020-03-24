import { Component, OnInit } from '@angular/core';
import { FireService, Survey } from 'src/app/services/survey/fire.service';
import { ActivatedRoute, Router } from '@angular/router';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { ProfileService } from 'src/app/services/user/profile.service';
import { Storage} from '@ionic/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { ModalController } from '@ionic/angular';
import { ShowMessagePage } from './show-message/show-message.page';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-answer',
  templateUrl: './answer.page.html',
  styleUrls: ['./answer.page.scss'],
})
export class AnswerPage implements OnInit {

  // Survey object and its fields
  survey: Survey = {
    title: '',
    surveyLink: '',
    type: '',
    daysTillRelease: '',
    daysBeforeDueDate: '',
    daysTillExpire: 0,
    daysInactive: 0,
    emotionChosen: '',
    pointsWorth: 0,
    userVisibility: [],
    surveyDescription: '',
  }

  // number of points the user currently has
  userPoints;
  
  // user's unique code for identification
  userCode;
  
  // survey id and interval is taking
  surveyData;
  
  // current user's taken surveys
  userSurveysTaken;
  
  constructor(private activatedRoute: ActivatedRoute, 
              private fs: FireService,
              private browser: InAppBrowser,
              private router: Router,
              private profile: ProfileService,
              private storage: Storage,
              private afs: AngularFirestore,
              private modalController: ModalController,
              public alertController: AlertController,
              ) { }

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
    let id = this.surveyData.split(":")[0];
   
    // if the id exists, assign the survey object to the survey for which the id belongs to
    if(id){
      this.fs.getSurvey(id).subscribe(survey => {
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
          });
        });
      }
    });

  }

  // opens survey link
  openPage(url: string) {
    // option to hide survey url
    const options: InAppBrowserOptions = {
      hideurlbar: 'yes'
    }
    // open the browser inside of the app, using the url, and the options
    const page = this.browser.create(url, `_blank`, options);
    
    // When the user exits the survey page show them a message
    page.on('exit').subscribe(event => {
      //this.showMessage()
      this.presentAlert();
    })
  }

  // message for the user on exiting the survey page
  async showMessage(){
    // create and display the message modal to the user
    const modal = await this.modalController.create({
      component: ShowMessagePage
    });

    // When the user closes the message submit the survey
    modal.onDidDismiss().then( val =>{
      this.submit();
    });

    return await modal.present();
  }

  // submits survey
  submit(){
    // boolean to check if current survey is inluded in the userSurveysTaken
    let includes = false;

    // if the userSurveysTaken is not empty, check if the current survey is included
    // if the current survey is included, set includes to true and change the
    // old survey interval to the current one to signfy that the survey has been
    // taken for the current interval and update the user's userSurveysTaken
    if(this.userSurveysTaken.length != 0){
      this.userSurveysTaken.forEach(taken =>{
        if(taken.split(":")[0].includes(this.survey.id)){
          includes = true;
          this.userSurveysTaken[this.userSurveysTaken.indexOf(taken)] = this.surveyData;
          this.fs.updateAnsweredSurveys(this.userCode, this.userSurveysTaken);
        }
      })
    }

    // if the userSurveysTaken is not empty or it does not include the current survey
    // then simply add it to the array with the current survey interval
    // and update the user's userSurveysTaken
    if(this.userSurveysTaken.length == 0 || !includes){
      this.userSurveysTaken.push(this.surveyData)
      console.log(this.userSurveysTaken)
      this.fs.updateAnsweredSurveys(this.userCode, this.userSurveysTaken);
    }

    // set the local storage daysSinceLogin to 0, this is so that the inactive days
    // survey disappears
    if(this.survey.type == 'Inactive'){
      this.storage.set('daysSinceLogin', 0);
    }

    // then increase the user's current points by the amount that the current
    // survey is worth, then navigate back to the home page
    let newPointValue = this.userPoints + this.survey.pointsWorth;
    this.profile.editRewardPoints(newPointValue, this.userCode);
    this.router.navigateByUrl('/home');
  }

  isComplete(){
    if(this.surveyData.split(":")[1] == "completed"){
      return true;
    }

    return false;
  }

  async presentAlert(){
    const alert = await this.alertController.create({
    header: 'Alert',
    subHeader: 'Thank You',
    message: 'Thanks for taking the Survey, your input is really appreciated.',
    buttons: [ {text: 'OK',
    handler: () => {
      this.submit();
      }}
    ]
  });

    await alert.present();
  }
}