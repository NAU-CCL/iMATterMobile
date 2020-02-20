import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FireService, Survey } from 'src/app/services/survey/fire.service';

const today = new Date();
const todaysDate = today.toISOString();

var dateJoined = new Date("02/10/2020");

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
      //index[0] = year, index[1] = month, index[2] = day, index[3] = hour, index[4] = minute,
      var currentTime = this.fs.getTime(todaysDate).split(" ");
      var currentString = currentTime[1] + "/" + currentTime[2] + "/" + currentTime[0];
      console.log(currentString);
      var now = new Date(currentString);
      var timeDifference = now.getTime() - dateJoined.getTime();
  
      var dayDifference = timeDifference / (1000 * 3600 * 24);
  
      if(dayDifference >= survey.daysTillRelease){
        return true
      }
  
      return false;
    }
}