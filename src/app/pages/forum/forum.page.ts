import { Component, OnInit } from '@angular/core';
import { QuestionService, Question } from 'src/app/services/infoDesk/question.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { AnalyticsService, Analytics, Sessions } from 'src/app/services/analyticsService.service';
import * as firebase from 'firebase/app';
import { AngularFirestore } from '@angular/fire/firestore';
import { AlertController } from '@ionic/angular';


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
      sessionID: '',
    };

  private questions: Observable<Question[]>;
  private analyticss: string;
  private sessions: Observable<any>;
  private thisUsersQuestions: Observable<Question[]>;

  public allQuestions: boolean;
  public usersQuestions: boolean;

  public questionList: any[];
  public loadedQuestionList: any[];

  public thisUserQuestionList: any[];
  public thisUserLoadedQuestionList: any[];

  public iosPlatform: boolean;

  constructor(private questionService: QuestionService,
    private storage: Storage,
    private router: Router,
    private afs: AngularFirestore,
    private analyticsService: AnalyticsService,
    private alertController: AlertController) {
  }

  ngOnInit() {
    this.storage.get('authenticated').then((val) => {
      if (val === 'false') {
        this.router.navigate(['/login/']);
      }
    });

    this.storage.get('platform').then((val) => {
      this.iosPlatform = val === 'ios';
    });

    this.getUserQuestions();
    this.getAllQuestions();

    // need to keep this
    this.questions = this.questionService.getQuestions();
    this.allQuestions = true;
    this.usersQuestions = false;
  }

  ionViewWillEnter() {
    this.addView();
  }

  getUserQuestions() {
    this.storage.get('userCode').then((val) => {
      if (val) {
        this.afs.collection('questions', ref => ref.where('userID', '==', val).orderBy('timestamp', 'desc'))
          .valueChanges({ idField: 'id' }).subscribe(questionList => {
            this.thisUserQuestionList = questionList;
            this.thisUserLoadedQuestionList = questionList;
          });
      }
    });
  }

  getAllQuestions() {
    this.afs.collection('questions', ref => ref.orderBy('timestamp', 'desc'))
      .valueChanges({ idField: 'id' }).subscribe(questionList => {
        this.questionList = questionList;

        this.loadedQuestionList = questionList;
      });
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
      var results = []
      this.thisUserQuestionList = this.thisUserQuestionList.filter(currentQuestion => {
        return (currentQuestion.title.toLowerCase().indexOf(searchInput.toLowerCase()) > -1 ||
          currentQuestion.description.toLowerCase().indexOf(searchInput.toLowerCase()) > -1);
      });
    }
  }

  filterQuestions(event) {
    console.log('called');
    this.initializeQuestions();

    const searchInput = event.target.value;

    if (searchInput) {
      this.questionList = this.questionList.filter(currentQuestion => {
        return (currentQuestion.title.toLowerCase().indexOf(searchInput.toLowerCase()) > -1 ||
          currentQuestion.description.toLowerCase().indexOf(searchInput.toLowerCase()) > -1);
      });
    }
  }

  addView() {
    //this.analytic.sessionID = this.session.id;
    this.storage.get('userCode').then((val) => {
      if (val) {
        const ref = this.afs.firestore.collection('users').where('code', '==', val);
        ref.get().then((result) => {
          result.forEach(doc => {
            this.analytic.page = 'infoDesk';
            this.analytic.userID = val;
            this.analytic.timestamp = firebase.firestore.FieldValue.serverTimestamp();
            //this.analytic.sessionID = this.idReference;
            this.analyticsService.addView(this.analytic).then(() => {
              console.log('successful added view: infoDesk');

            }, err => {
              console.log('unsucessful added view: infoDesk');

            });
          });
        });
      }
    });
  }

  // gets admin set point amount and uses that to
  displayForumInfo() {
    this.presentAlert('What is the Information Desk?',
      'The information desk is a forum where you can ask questions and respond to other ' +
      'user questions. Here, all users ' +
      'can see your questions, not just your cohort. You have the option to ask or comment anonymously' +
      ', allowing you to remain even more secret. Questions can be answered by providers, which ' +
      'include clinic workers, nurses, and more.');
  }

  // present a basic alert -- used for displaying gc info
  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }


}
