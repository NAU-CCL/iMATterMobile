import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { SurveyService, Survey } from 'src/app/services/survey/survey.service';
import { Storage } from '@ionic/storage';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ProfileService } from 'src/app/services/user/profile.service';
import { DatePipe } from '@angular/common';
import { StorageService } from 'src/app/services/storage/storage.service';

// Today's date as a Javascript Date Object
const today = new Date();

@Component({
  selector: 'app-available',
  templateUrl: './available.page.html',
  styleUrls: ['./available.page.scss'],
})

export class AvailablePage implements OnInit {
  public surveys: Observable<Survey[]>;
  public userSurveys: Survey[] = [];
  public userCode = '';
  public emotion = '';
  public daysAUser = '';
  public dueDate = '';
  public answeredSurveys = [];
  public completed = '';
  public userVisibility;
  public user;
  public surveyComplete;
  private storage: Storage = null; 
  
  constructor(private surveySerivce: SurveyService,
    private storageService: StorageService,
    private router: Router,
    public afs: AngularFirestore,
    private activatedRoute: ActivatedRoute,
    private userService: ProfileService,
    private datepipe: DatePipe
  ) {
  }

  async ngOnInit() {
    this.storage = await this.storageService.getStorage();
    this.storage.get('authenticated').then((val) => {
      if (val === 'false') {
        this.router.navigate(['/login/']);
      }
    });
  }

  ionViewDidEnter() {

    // get all the surveys available
    this.surveys = this.surveySerivce.getSurveys();
    console.log(this.surveys);

    // obtain the user's code, emotion, days being a user, due date, and answered surveys
    this.storage.get('userCode').then((val) => {
      if (val) {
        const ref = this.afs.firestore.collection('users').where('code', '==', val);
        ref.get().then((result) => {
          result.forEach(doc => {
            this.user = doc;
            this.userCode = val;
            this.emotion = doc.get('mood');
            this.daysAUser = doc.get('daysAUser');
            this.dueDate = doc.get('dueDate').split('-');
            this.answeredSurveys = doc.get('answeredSurveys');
            this.completed = doc.get('answeredSurveys');
            this.userSurveys = doc.get('availableSurveys');

            this.updateSurveys();
          });
        });
      }
    });
  }


  isDisplayed(survey: Survey) {
  }

  // isCompleted(survey: Survey) {
  //   let complete = false;
  //   this.answeredSurveys.forEach(id => {
  //     if (id.split(':')[0] === survey.id) {
  //       complete = true;
  //     }
  //   });
  //   return complete;
  // }

  answerSurvey(survey: Survey) {
    let submitData;
    submitData = survey.id + ':' + this.daysAUser;
    this.router.navigate(['/tabs/home/available/answer/' + submitData]);

  }

  updateSurveys() {
    const currentSurveys = this.user.get('availableSurveys');
    this.surveys.forEach(surveyArray => {
      surveyArray.forEach(survey => {
        this.checkComplete(survey);
        console.log(this.surveyComplete);
        if (!this.surveyComplete) {
          if (survey['type'] == 'Days After Joining') {
            var characteristics = survey['characteristics'];
            if (this.user.get('daysAUser') >= characteristics['daysAfterJoining']) {
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
            var dayOfWeek = weekdays[date.getDay()];
            var dayOfMonth = date.getDate();
            if (characteristics['repeatEvery']) {
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
        } else {
          this.surveyComplete = false;
        }
        this.userSurveys = currentSurveys;
        this.userService.updateAvailableSurveys(currentSurveys, this.userCode);
      });
    });
  }

  checkComplete(survey) {
    const surveyID = survey['id'];
    const today = new Date();
    const todayString = this.datepipe.transform(today, 'y-MM-dd');
    this.answeredSurveys.forEach(complete => {
      if (survey['type'] === 'Repeating') {
        if (complete['survey'] === surveyID && todayString === complete['date']) {
          this.surveyComplete = true;
        }
      } else {
        if (complete['survey'] === surveyID) {
          this.surveyComplete = true;
        }
      }
    });
  }
}
