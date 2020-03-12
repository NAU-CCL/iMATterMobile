import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FireService, Survey } from 'src/app/services/survey/fire.service';
import { Storage} from '@ionic/storage';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';

// // Today's date as a javascript Date Object
const today = new Date();

@Component({
  selector: 'app-available',
  templateUrl: './available.page.html',
  styleUrls: ['./available.page.scss'],
})

export class AvailablePage implements OnInit {
  private surveys: Observable<Survey[]>;

  // user's due date
  dueDate;
  // user's current emotion
  emotion;
  // user's joined date
  daysAUser;
  // interval of survey for which user is currently in
  surveyInterval = [];
  // surveys answered by the user to check if the survey should be available
  answeredSurveys = [];
  // user code to make updates on
  userCode;
  // array of of users that can see the survey
  userVisibility = []
  // Temporary Inactive days variable
  inactiveDays = 20;

  constructor(private fs: FireService,
              private storage: Storage, 
              private router: Router, 
              public afs: AngularFirestore
              ) { }

  ngOnInit() {
    this.storage.get('authenticated').then((val) => {
      if (val === 'false') {
        this.router.navigate(['/login/']);
      }
    });

    this.surveys = this.fs.getSurveys();

    // obtain the user's code, emotion, days being a user, due date, and answered surveys
    this.storage.get('userCode').then((val) => {
      if (val) {
        const ref = this.afs.firestore.collection('users').where('code', '==', val);
        ref.get().then((result) => {
          result.forEach(doc => {
            this.userCode = val;
            this.emotion = doc.get('mood');
            this.daysAUser = doc.get('daysAUser');
            this.dueDate = doc.get('dueDate').split('-');
            this.answeredSurveys = doc.get('answeredSurveys');
            console.log("TEST: ", this.answeredSurveys);
          });
        });
      }
    });
  }
  
  // isDisplayed determines if the survey shows up for the user or not
  isDisplayed(survey: Survey){
    this.userVisibility = survey.userVisibility;
    //array of days that will determine when the survey is displayed
    let daysArray;
    // number of days before the Survey expires
    var expirationDays = survey.daysTillExpire;
    var canDisplay = false;
    var includes = false;

    if(survey.userVisibility.includes(this.userCode)){
      if(survey.type == 'After Joining'){
        daysArray = survey.daysTillRelease.split(/(?:,| )+/);
        daysArray.forEach(day => {
          if(this.daysAUser >= parseInt(day) && this.daysAUser < parseInt(day) + expirationDays){
            this.answeredSurveys.forEach( answered => {
              if(answered.split(":")[0] == survey.id && answered.split(":")[1] == day){
                canDisplay = false;
                includes = true;
              }

              if(answered.split(":")[0] == survey.id && answered.split(":")[1] != day){
                canDisplay = true;
                includes = true;
                this.surveyInterval.push(survey.id + ":" + day);
              }
            })

            if(!includes){
              canDisplay = true;
              this.surveyInterval.push(survey.id + ":" + day);
            }
          }
        })
      }

      if(survey.type == 'Due Date'){
        daysArray = survey.daysTillRelease.split(/(?:,| )+/);
        daysArray.forEach(day => {
          if(this.daysAUser <= parseInt(day) && this.daysAUser > parseInt(day) - expirationDays){
            this.answeredSurveys.forEach( answered => {
              if(answered.split(":")[0] == survey.id && answered.split(":")[1] == day){
                canDisplay = false;
                includes = true;
              }

              if(answered.split(":")[0] == survey.id && answered.split(":")[1] != day){
                canDisplay = true;
                includes = true;
                this.surveyInterval.push(survey.id + ":" + day);
              }
            })

            if(!includes){
              canDisplay = true;
              this.surveyInterval.push(survey.id + ":" + day);
            }
          }
        })
      }

      if(survey.type == 'Inactive'){
        if(survey.daysInactive <= this.inactiveDays){
          canDisplay = true;
        }
      }

      if(survey.type == 'Emotion'){
        if(survey.emotionChosen == this.emotion){
          this.answeredSurveys.forEach( answered => {
            if(answered.split(":")[0] == survey.id && answered.split(":")[1] == ("" + today.getDate())){
              canDisplay = false;
              includes = true;
            }
            if(answered.split(":")[0] == survey.id && answered.split(":")[1] != ("" + today.getDate())){
              canDisplay = true;
              includes = true;
              this.surveyInterval.push(survey.id + ":" + today.getDate());
            }
          })

          if(!includes){
            canDisplay = true;
            this.surveyInterval.push(survey.id + ":" + today.getDate());
          }
        }
      }
    }

    return canDisplay;
  }

  answerSurvey(survey: Survey){
    var submitData;

    if(survey.type != 'Inactive'){
      this.surveyInterval.forEach( surv => {
        if(surv.split(":")[0] == survey.id){
          submitData = surv;
        }
      })      
    }
    
    if(survey.type == 'Inactive'){
      submitData = survey.id + ":" + "0";
    }

    this.router.navigate(['/answer/' + submitData])
  }

 }