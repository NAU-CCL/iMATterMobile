import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FireService, Survey } from 'src/app/services/survey/fire.service';
import { Storage} from '@ionic/storage';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';

// Today's date as a javascript Date Object
const today = new Date();
// Today's date in ISOString format
const todaysDate = today.toISOString();

// Temporary Inactive days variable
var inactiveDays = 20;

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
  joined;
  // interval of survey for which user is currently in
  surveyInterval = [];
  // surveys answered by the user to check if the survey should be available
  answeredSurveys = [];
  // user code to make updates on
  userCode;
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
        
    // obtain the user's emotion, duedate, joined date, answered surveys, and user code
    this.storage.get('userCode').then((val) => {
      if (val) {
        const ref = this.afs.firestore.collection('users').where('code', '==', val);
        ref.get().then((result) => {
          result.forEach(doc => {
            this.userCode = val;
            this.emotion = doc.get('mood');
            this.joined = doc.get('joined');
            this.dueDate = doc.get('dueDate').split('-');
            this.answeredSurveys = doc.get('answeredSurveys');
            console.log("TEST: ", this.answeredSurveys);
          });
        });
      }
    });
  }

 ionViewDidEnter(){
    // get all existing surveys
    this.surveys = this.fs.getSurveys();
  }
  
  // isDisplayed determines if the survey shows up for the user or not
  isDisplayed(survey: Survey){
    // boolean to determine if the survey will be displayed
    let isDisplayed = false;
    let included = false;
    // dateJoined of the user as a date object
    let dateJoined = new Date( this.joined.toDate().getMonth()+1 + "/" + this.joined.toDate().getDate() + "/" + this.joined.toDate().getFullYear());
    // dueDate of the user as a date object
    let dateDue = new Date(this.dueDate[1] + "/" + this.dueDate[2] + "/" + this.dueDate[0]);
    // todaysDate string split into an array
    let currentTime = this.fs.getTime(todaysDate).split(" ");
    // obtaining the current month/day/year from the currentTime array
    let currentString = currentTime[1] + "/" + currentTime[2] + "/" + currentTime[0];
    // passing the current month/day/year to a Date object
    let now = new Date(currentString);
    // taking the difference in time between today and the date joined
    let timeSinceJoined = now.getTime() - dateJoined.getTime();
    // taking the difference in time between the date due and today
    let timeBeforeDue =  dateDue.getTime() - now.getTime();
    // converting the difference from milliseconds to days
    let daysSinceJoined = timeSinceJoined / (1000 * 3600 * 24);
    // converting the difference from milliseconds to days
    let daysBeforeDue = timeBeforeDue / (1000 * 3600 * 24);
    // days after the survey is displayed before it expires
    let expirationDays = survey.daysTillExpire;
    // array of days that will determine when the survey is displayed
    let daysArray;

    // if the survey type is After joining check if the number of days since the users joined
    // is within the range of days and expiration, if it is then check if the users already
    // has taken the survey for that interval, if not then let them take it otherwise prevent them
    if(survey.type == 'After Joining'){
      daysArray = survey.daysTillRelease.split(/(?:,| )+/);

      for(var index in daysArray){
        if(daysSinceJoined >= parseInt(daysArray[index]) && daysSinceJoined < parseInt(daysArray[index]) + expirationDays){
          this.answeredSurveys.forEach( val => {
            if(val.split(":").includes(survey.id)){
              if(val.split(":")[1] == daysArray[index]){
                isDisplayed = false;
                included = true;
              }
              else{
                isDisplayed = true;
                included = true;
                this.surveyInterval.push(survey.id + ":" + daysArray[index]);
              }
            }
          });
          
          if(!included){
            isDisplayed = true;
            this.surveyInterval.push(survey.id + ":" + daysArray[index]);
          }
        }
      }
    }

    // if the survey type is Due Date check if the number of days before the user's due date
    // is within the range of days and expiration, if it is then check if the users already
    // has taken the survey for that interval, if not then let them take it otherwise prevent them
    if(survey.type == 'Due Date'){
      daysArray = survey.daysBeforeDueDate.split(/(?:,| )+/);

      for(var index in daysArray){
        if(daysBeforeDue <= parseInt(daysArray[index]) && daysBeforeDue > parseInt(daysArray[index]) - expirationDays){
          this.answeredSurveys.forEach( val => {
            if(val.split(":").includes(survey.id)){
              if(val.split(":")[1] == daysArray[index]){
                isDisplayed = false;
                included = true;
              }
              else{
                isDisplayed = true;
                included = true;
                this.surveyInterval.push(survey.id + ":" + daysArray[index]);
              }
            }
          });

          if(!included){
            isDisplayed = true;
            this.surveyInterval.push(survey.id + ":" + daysArray[index]);
          }
        }
      }
    }

    // if the survey type is Inactive, check if the user has taken the survey otherwise,
    // check if the number of days the user has been inactive match or exceed the days set
    // for the survey to show up
    if(survey.type == 'Inactive'){

      if(inactiveDays >= survey.daysInactive){
        this.surveyInterval.push(survey.id + ":" + currentTime[2]);
        isDisplayed = true;
      }

      this.answeredSurveys.forEach( val => {
        if(val.split(":")[1] == currentTime[2] && val.split(":").includes(survey.id)){
          isDisplayed = false;
        } 
      })
    }

    // if the survey type is Emotion, check if the user has taken the survey otherwise,
    // check if the user's emotion matches the emotion set for the survey
    if(survey.type == 'Emotion'){

      if(survey.emotionChosen == 'excited' && this.emotion == 'excited'){
        this.surveyInterval.push(survey.id + ":" + currentTime[2]);
        isDisplayed = true;
      }

      if(survey.emotionChosen == 'happy' && this.emotion == 'happy'){
        this.surveyInterval.push(survey.id + ":" + currentTime[2]);
        isDisplayed = true;
      }

      if(survey.emotionChosen == 'loved' && this.emotion == 'loved'){
        this.surveyInterval.push(survey.id + ":" + currentTime[2]);
        isDisplayed = true;
      }

      if(survey.emotionChosen == 'indifferent' && this.emotion == 'indifferent'){
        this.surveyInterval.push(survey.id + ":" + currentTime[2]);
        isDisplayed = true;
      }

      if(survey.emotionChosen == 'overwhelmed' && this.emotion == 'overwhelmed'){
        this.surveyInterval.push(survey.id + ":" + currentTime[2]);
        isDisplayed = true;
      }

      if(survey.emotionChosen == 'sad' && this.emotion == 'sad'){
        this.surveyInterval.push(survey.id + ":" + currentTime[2]);
        isDisplayed = true;
      }

      if(survey.emotionChosen == 'angry' && this.emotion == 'angry'){
        this.surveyInterval.push(survey.id + ":" + currentTime[2]);
        isDisplayed = true;
      }
      
      this.answeredSurveys.forEach( val => {
        if(val.split(":")[1] == currentTime[2] && val.split(":").includes(survey.id)){
          isDisplayed = false;
        } 
      })
    }

    return isDisplayed;
  }

  // updateAccess updates the interval for which the user has taken the survey
  updateAccess(survey: Survey){
    let includes = false;

    // If the survey type is After Joining store the survey id and the Interval to signify that is has been taken
    if(survey.type == 'After Joining'){
      for(var index in this.surveyInterval){
        if(this.surveyInterval[index].split(":").includes(survey.id)){
          
          this.answeredSurveys.forEach( val =>{
            if(val.split(":").includes(survey.id)){
              includes = true;
              this.answeredSurveys[this.answeredSurveys.indexOf(val)] = this.surveyInterval[index];
              this.fs.updateAnsweredSurveys(this.userCode, this.answeredSurveys);
            }
          });
          
          if(!includes){
            this.answeredSurveys.push(this.surveyInterval[index]);
            this.fs.updateAnsweredSurveys(this.userCode, this.answeredSurveys);
          }
        }
      }
    }

    // If the survey type is Due Date store the survey id and the Interval to signify that is has been taken
    if(survey.type == 'Due Date'){
      for(var index in this.surveyInterval){
        if(this.surveyInterval[index].split(":").includes(survey.id)){
          
          this.answeredSurveys.forEach( val =>{
            if(val.split(":").includes(survey.id)){
              includes = true;
              this.answeredSurveys[this.answeredSurveys.indexOf(val)] = this.surveyInterval[index];
              this.fs.updateAnsweredSurveys(this.userCode, this.answeredSurveys);
            }
          });
          
          if(!includes){
            this.answeredSurveys.push(this.surveyInterval[index]);
            this.fs.updateAnsweredSurveys(this.userCode, this.answeredSurveys);
          }
        }
      }
    }

    // If the survey type is Inactive store the survey id and false to signify that is has been taken
    if(survey.type == 'Inactive'){
      for(var index in this.surveyInterval){
        if(this.surveyInterval[index].split(":").includes(survey.id)){
          
          this.answeredSurveys.forEach( val =>{
            if(val.split(":").includes(survey.id)){
              includes = true;
              this.answeredSurveys[this.answeredSurveys.indexOf(val)] = this.surveyInterval[index];
              this.fs.updateAnsweredSurveys(this.userCode, this.answeredSurveys);
            }
          });
          
          if(!includes){
            this.answeredSurveys.push(this.surveyInterval[index]);
            this.fs.updateAnsweredSurveys(this.userCode, this.answeredSurveys);
          }
        }
      }
    }

    // If the survey type is Emotion store the survey id and false to signify that is has been taken
    if(survey.type == 'Emotion'){
      for(var index in this.surveyInterval){
        if(this.surveyInterval[index].split(":").includes(survey.id)){
          
          this.answeredSurveys.forEach( val =>{
            if(val.split(":").includes(survey.id)){
              includes = true;
              this.answeredSurveys[this.answeredSurveys.indexOf(val)] = this.surveyInterval[index];
              this.fs.updateAnsweredSurveys(this.userCode, this.answeredSurveys);
            }
          });
          
          if(!includes){
            this.answeredSurveys.push(this.surveyInterval[index]);
            this.fs.updateAnsweredSurveys(this.userCode, this.answeredSurveys);
          }
        }
      }
    }
  }
}