import { Component, OnInit } from '@angular/core';
import { QuestionService, Question } from 'src/app/services/infoDesk/question.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { AnalyticsService, Analytics, Sessions  } from 'src/app/services/analyticsService.service';
import * as firebase from 'firebase/app';
import {AngularFirestore} from '@angular/fire/firestore';


@Component({
  selector: 'app-forum',
  templateUrl: './forum.page.html',
  styleUrls: ['./forum.page.scss'],
})
export class ForumPage implements OnInit {
  analytic: Analytics =
{
  page: '',
  userID: '',
  timestamp: '',
  sessionID: ''
};

  private questions: Observable<Question[]>;
  private analyticss: string;
  private sessions: Observable<any>;
  private thisUsersQuestions: Observable<Question[]>;

  private allPosts: boolean;
  private usersPosts: boolean;

  public questionList: any[];
  public loadedQuestionList: any[];

  public thisUserQuestionList: any[];
  public thisUserLoadedQuestionList: any[];

  constructor(private questionService: QuestionService,
              private storage: Storage,
              private router: Router,
              private afs: AngularFirestore,
              private analyticsService: AnalyticsService) {
  }

  ngOnInit() {
    this.storage.get('authenticated').then((val) => {
      if (val === 'false') {
        this.router.navigate(['/login/']);
      }
    });
    this.storage.get('userCode').then((val) => {
      if (val) {
        this.afs.collection('questions', ref => ref.where('userID', '==', val).orderBy('timestamp'))
            .valueChanges({ idField: 'id' }).subscribe(questionList => {
          this.thisUserQuestionList = questionList;
          console.log(this.questionList);
          this.thisUserLoadedQuestionList = questionList;
        });
      }
    });

    this.afs.collection('questions', ref => ref.orderBy('timestamp', 'desc'))
        .valueChanges({ idField: 'id' }).subscribe(questionList => {
      this.questionList = questionList;
      console.log(this.questionList);
      this.loadedQuestionList = questionList;
    });


    this.questions = this.questionService.getQuestions();
    this.allPosts = true;
    this.usersPosts = false;
  }

  ionViewWillEnter() {
    this.addView();
   }

  initializeQuestions(): void {
    this.questionList = this.loadedQuestionList;
  }

  initializeUserQuestions(): void {
    this.thisUserQuestionList = this.thisUserLoadedQuestionList;
  }

  filterUserQuestions(event) {
    console.log('called');
    this.initializeUserQuestions();

    const searchInput = event.target.value;

    if (searchInput) {
      this.thisUserQuestionList = this.thisUserQuestionList.filter(currentQuestion => {
        return(currentQuestion.title.toLowerCase().indexOf(searchInput.toLowerCase()) > -1);
      });
    }
  }

  filterQuestions(event) {
    console.log('called');
    this.initializeQuestions();

    const searchInput = event.target.value;

    if (searchInput) {
      this.questionList = this.questionList.filter(currentQuestion => {
        return(currentQuestion.title.toLowerCase().indexOf(searchInput.toLowerCase()) > -1);
      });
    }
  }

  addView(){
  //this.analytic.sessionID = this.session.id;
  this.storage.get('userCode').then((val) =>{
    if (val) {
      const ref = this.afs.firestore.collection('users').where('code', '==', val);
      ref.get().then((result) =>{
        result.forEach(doc =>{
          this.analytic.page = 'infoDesk';
          this.analytic.userID = val;
          this.analytic.timestamp = firebase.firestore.FieldValue.serverTimestamp();
          //this.analytic.sessionID = this.idReference;
          this.analyticsService.addView(this.analytic).then (() =>{
            console.log('successful added view: infoDesk');

          }, err =>{
            console.log('unsucessful added view: infoDesk');

          });
        });
      });
    }
  });
}


}
