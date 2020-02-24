import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FireService, Survey } from 'src/app/services/survey/fire.service';

const today = new Date();
const todaysDate = today.toISOString();

var dateJoined = new Date("02/07/2020");
var dateDue = new Date("03/13/2020");
var inactiveDays = 20;
var emotion = 'Negative';

@Component({
  selector: 'app-available',
  templateUrl: './available.page.html',
  styleUrls: ['./available.page.scss'],
})
export class AvailablePage implements OnInit {
  private surveys: Observable<Survey[]>;

  constructor(private fs: FireService) { }

  ngOnInit() {
    this.surveys = this.fs.getSurveys();
    console.log(today);
    console.log(todaysDate);
  }
  
  isDisplayed(survey: Survey){
    // boolean to determine if the survey will be displayed
    let isDisplayed = false;
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
      if(survey.emotionChosen == 'Negative' && emotion == 'Negative'){
        isDisplayed = true;
      }

      if(survey.emotionChosen == 'Indifferent' && emotion == 'Indifferent'){
        isDisplayed = true;
      }

      if(survey.emotionChosen == 'Postive' && emotion == 'Postive'){
        isDisplayed = true;
      }
    }

    return isDisplayed;
  }
}