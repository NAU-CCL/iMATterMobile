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
  userVisibility = [];
  // number of Inactive days
  inactiveDays;

  completed = [];

  constructor(private fs: FireService,
              private storage: Storage, 
              private router: Router, 
              public afs: AngularFirestore
              ) { }

  ngOnInit() {
    // survey object and its fields
    this.storage.get('authenticated').then((val) => {
      if (val === 'false') {
        this.router.navigate(['/login/']);
      }
    });  

  }

  ionViewDidEnter(){
    // get all the surveys available
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

    this.storage.get('daysSinceLogin').then((val) => {
      this.inactiveDays = val;
    })
  }



  // isDisplayed determines if the survey shows up for the user or not
  isDisplayed(survey: Survey){
    // array which includes the userId of all of users who can take this survey
    this.userVisibility = survey.userVisibility;
    //array of days that will determine when the survey is displayed
    var daysArray;
    // number of days before the Survey expires
    var expirationDays;
    // boolean to determine if the survey can be displayed to the user
    var canDisplay = false;
    // boolean to determine if a certain item is included in the answeredSurveys array
    var includes = false;
    // date due of the current user
    var dateDue = new Date(this.dueDate[1] + "/" + this.dueDate[2] + "/" + this.dueDate[0]);
    // time in milliseconds before the user's due date
    var timeBeforeDue =  dateDue.getTime() - today.getTime();
    // time in days before the user's due date
    var daysBeforeDue = Math.trunc( timeBeforeDue / (1000 * 3600 * 24) );
    
    // if the user is inside the survey's userVisibility array
    //if(survey.userVisibility.includes(this.userCode)){
      // if the survey type is after joining, show it to the user if their join date is between 
      // a value of the daysArray and the expiration date, if the user's join date is not between
      // those dates or if they have already taken the survey for this interval then don't show

      if(survey.daysTillExpire == 0){
        expirationDays = survey.daysTillExpire + 100000;
      }

      if(survey.daysTillExpire != 0){
        expirationDays = survey.daysTillExpire;
      }
      
      if(survey.type == 'After Joining'){
        daysArray = survey.daysTillRelease.split(/(?:,| )+/);
        daysArray.forEach(day => {
          if(this.daysAUser >= parseInt(day) && this.daysAUser <= parseInt(day) + expirationDays){
            this.answeredSurveys.forEach( answered => {
              if(answered.split(":")[0] == survey.id && answered.split(":")[1] == day){
                canDisplay = true;
                this.completed.push(survey.id);
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

      // if the survey type is Due Date, show it to the user if their duedate is between 
      // a value of the daysArray and the expiration date, if the user's join date is not between
      // those dates or if they have already taken the survey for this interval then don't show
      if(survey.type == 'Due Date'){
        daysArray = survey.daysBeforeDueDate.split(/(?:,| )+/);
        daysArray.forEach(day => {
          if(daysBeforeDue <= parseInt(day) && daysBeforeDue >= parseInt(day) - expirationDays){
            this.answeredSurveys.forEach( answered => {
              if(answered.split(":")[0] == survey.id && answered.split(":")[1] == day){
                canDisplay = true;
                this.completed.push(survey.id);
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

      // if the survey type is inactive and the user's inactive days meets or exceeds the
      // surveys inactive days field, then display to the user
      if(survey.type == 'Inactive'){
        if(survey.daysInactive <= this.inactiveDays){
          canDisplay = true;
        }
      }

      // if the survey type is Emotion and the user's emotion matches the survey's
      // emotion field, then display to the user
      if(survey.type == 'Emotion'){
        if(survey.emotionChosen == this.emotion){
          canDisplay = true;
          // this.answeredSurveys.forEach( answered => {
          //   if(answered.split(":")[0] == survey.id && answered.split(":")[1] == ("" + today.getDate())){
          //     canDisplay = false;
          //     includes = true;
          //   }
          //   if(answered.split(":")[0] == survey.id && answered.split(":")[1] != ("" + today.getDate())){
          //     canDisplay = true;
          //     includes = true;
          //     this.surveyInterval.push(survey.id + ":" + today.getDate());
          //   }
          // })

          // if(!includes){
          //   canDisplay = true;
          //   this.surveyInterval.push(survey.id + ":" + today.getDate());
          // }
        }
      }
   // }

   // return if the user can see the survey or not
    return canDisplay;
  }

  isComplete(survey: Survey){
    if(this.completed.includes(survey.id)){
      return true;
    }

    return false;
  }

  // takes the survey selected by passing the id and survey current interval 
  answerSurvey(survey: Survey){
    // includes the survey id and current interval the user is taking it in
    var submitData;

    // if the survey type is not inactive, take the survey interval for the current
    // survey and assign it to submit data
    if(survey.type != 'Inactive' && survey.type != 'Emotion'){
      this.surveyInterval.forEach( surv => {
        if(surv.split(":")[0] == survey.id){
          submitData = surv;
        }
      })      
    }

    if(this.isComplete(survey)){
      submitData = survey.id + ":" + "completed";
    }
  
    // since the inactive and emotion surveys are dealt with differently, 
    // just add the survey id with a 0
    if(survey.type == 'Inactive' || survey.type == 'Emotion'){
      submitData = survey.id + ":" + "0";
    }

    // navigate to the answer page and pass the submitData
    this.router.navigate(['/answer/' + submitData])
  }

 }
