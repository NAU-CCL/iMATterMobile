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
        this.thisUsersQuestions = this.questionService.getThisUsersQuestions(val);
      }
    });

    this.questions = this.questionService.getQuestions();
    this.allPosts = true;
    this.usersPosts = false;
  }

  ionViewWillEnter() {
    this.addView();
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
