import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { SurveyService, Survey } from 'src/app/services/survey/survey.service';
import { Storage } from '@ionic/storage';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';

// Today's date as a Javascript Date Object
const today = new Date();

@Component({
  selector: 'app-available',
  templateUrl: './available.page.html',
  styleUrls: ['./available.page.scss'],
})

export class AvailablePage implements OnInit {
  public surveys: Observable<Survey[]>;
  public userSurveys: String[];
  public userCode = '';
  public emotion = '';
  public daysAUser = '';
  public dueDate = '';
  public answeredSurveys = [];
  public completed = '';
  public userVisibility;

  constructor(private surveySerivce: SurveyService,
    private storage: Storage,
    private router: Router,
    public afs: AngularFirestore,
    private activatedRoute: ActivatedRoute,
  ) {
  }

  ngOnInit() {

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
            this.userCode = val;
            this.emotion = doc.get('mood');
            this.daysAUser = doc.get('daysAUser');
            this.dueDate = doc.get('dueDate').split('-');
            this.answeredSurveys = doc.get('answeredSurveys');
            this.completed = doc.get('answeredSurveys');
            this.userSurveys = doc.get('availableSurveys');
          });
        });
      }
    });
  }


  isDisplayed(survey: Survey) {
  }

  isCompleted(survey: Survey) {
    let complete = false;
    this.answeredSurveys.forEach(id => {
      if (id.split(':')[0] === survey.id) {
        complete = true;
      }
    });
    return complete;
  }

  answerSurvey(survey: Survey) {

    let submitData;
    submitData = survey.id + ':' + this.daysAUser;
    this.router.navigate(['/tabs/home/available/answer/' + submitData]);

  }
}

