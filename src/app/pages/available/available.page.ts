import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FireService, Survey } from 'src/app/services/survey/fire.service';
import { Storage} from '@ionic/storage';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';

const today = new Date();
const todaysDate = today.toISOString();

//var dateJoined = new Date("02/07/2020");

var inactiveDays = 20;

@Component({
  selector: 'app-available',
  templateUrl: './available.page.html',
  styleUrls: ['./available.page.scss'],
})
export class AvailablePage implements OnInit {
  private surveys: Observable<Survey[]>;

  dueDate;
  emotion;
  joined;

  constructor(private fs: FireService, private storage: Storage, private router: Router, public afs: AngularFirestore) { }

  ngOnInit() {
    this.storage.get('authenticated').then((val) => {
      if (val === 'false') {
        this.router.navigate(['/login/']);
      }
    });

    this.surveys = this.fs.getSurveys();

    this.storage.get('userCode').then((val) => {
      if (val) {
        const ref = this.afs.firestore.collection('users').where('code', '==', val);
        ref.get().then((result) => {
          result.forEach(doc => {
            this.emotion = doc.get('mood');
            this.joined = doc.get('joined');
          });
        });
      }
    });

    this.storage.get("dueDate").then(value => {
      if (value != null){
        // dueDate[0] = year
        // dueDate[1] = month
        // dueDate[2] = day
        this.dueDate = value.toString().split('-');
        // console.log('User Due Date: '+ this.dueDate[2]);
      }
    })
  }
  
  isDisplayed(survey: Survey){
    // boolean to determine if the survey will be displayed
    let isDisplayed = false;
    // dateJoined of the user
    let dateJoined = new Date( this.joined.toDate().getMonth()+1 + "/" + this.joined.toDate().getDate() + "/" + this.joined.toDate().getFullYear());
    console.log("testDate: " + dateJoined);
    // dueDate of the user
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

    if(survey.type == 'After Joining'){
      daysArray = survey.daysTillRelease.split(/(?:,| )+/);

      for(var index in daysArray){
        if(daysSinceJoined >= parseInt(daysArray[index]) && daysSinceJoined < parseInt(daysArray[index]) + expirationDays){
          isDisplayed = true;
        }
      }
    }

    if(survey.type == 'Due Date'){
      daysArray = survey.daysBeforeDueDate.split(/(?:,| )+/);

      for(var index in daysArray){
        if(daysBeforeDue <= parseInt(daysArray[index]) && daysBeforeDue > parseInt(daysArray[index]) - expirationDays){
          isDisplayed = true;
        }
      }
    }

    if(survey.type == 'Inactive'){
      if(inactiveDays >= survey.daysInactive){
        isDisplayed = true;
      }
    }

    if(survey.type == 'Emotion'){
      if(survey.emotionChosen == 'excited' && this.emotion == 'excited'){
        isDisplayed = true;
      }

      if(survey.emotionChosen == 'happy' && this.emotion == 'happy'){
        isDisplayed = true;
      }

      if(survey.emotionChosen == 'loved' && this.emotion == 'loved'){
        isDisplayed = true;
      }
      if(survey.emotionChosen == 'indifferent' && this.emotion == 'indifferent'){
        isDisplayed = true;
      }

      if(survey.emotionChosen == 'overwhelmed' && this.emotion == 'overwhelmed'){
        isDisplayed = true;
      }

      if(survey.emotionChosen == 'sad' && this.emotion == 'sad'){
        isDisplayed = true;
      }
      if(survey.emotionChosen == 'angry' && this.emotion == 'angry'){
        isDisplayed = true;
      }
    }

    return isDisplayed;
  }
}