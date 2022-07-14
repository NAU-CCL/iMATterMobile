import {Component, OnInit, ViewChild} from '@angular/core';
import { QuestionService, Question, Answer } from 'src/app/services/infoDesk/question.service';
import {ActivatedRoute, Router} from '@angular/router';
import {IonContent, ToastController} from '@ionic/angular';
import { Storage } from '@ionic/storage';
import {Observable} from 'rxjs';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import * as firebase from 'firebase/app';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-forum-thread',
  templateUrl: './forum-thread.page.html',
  styleUrls: ['./forum-thread.page.scss'],
})
export class ForumThreadPage implements OnInit {
    @ViewChild('content', {static: true}) content: IonContent;

  question: Question = {
    title: '',
    description: '',
    username: '',
    userID: '',
    timestamp: undefined,
    profilePic: '',
    anon: false,
    type: '',
    numOfAnswers: 0,
    commenters: []
  };

    answer: Answer = {
    input: '',
    username: '',
    questionID: '',
    userID: '',
    timestamp: undefined,
    profilePic: '',
    anon: false,
    type: ''
  };

    public showAnswerBox: boolean = false;
    public anon: boolean;
    public currentAnon: boolean;
    public answers: Observable<any>;
    public answerForm: FormGroup;
    public anonPic: string;

  constructor(private afs: AngularFirestore,
              private activatedRoute: ActivatedRoute,
              private questionService: QuestionService,
              private toastCtrl: ToastController,
              private router: Router,
              private storage: Storage,
              private formBuilder: FormBuilder) {

      this.answerForm = this.formBuilder.group({
          comment: ['',
              Validators.compose([Validators.required, Validators.minLength(1)])],
          anon: [],
      });

  }

  ngOnInit() {

      this.storage.get('authenticated').then((val) => {
          if (val === 'false') {
              this.router.navigate(['/login/']);
          }
      });

      let id = this.activatedRoute.snapshot.paramMap.get('id');
      if (id) {
          this.questionService.getQuestion(id).subscribe(question => {
              this.question = question;
          });
          this.answers = this.questionService.getAnswers(id);
          this.getAutoProfilePic();
      }
  }

  addAnswer(answerForm: FormGroup) {
      this.scrollToBottom();
      console.log(answerForm.value.anon);
      if (!answerForm.valid) {
          this.showToast('Please enter an answer');
      } else {
          this.answer.type = 'user';
          this.answer.anon = answerForm.value.anon;
          this.answer.questionID = this.question.id;
          this.answer.input = answerForm.value.comment;
          this.storage.get('userCode').then((val) => {
              if (val) {
                  const ref = this.afs.firestore.collection('users').where('code', '==', val);
                  ref.get().then((result) => {
                      result.forEach(doc => {

                          this.answer.userID = val;

                          if (!this.answer.anon) {
                              this.currentAnon = false;
                              this.answer.username = doc.get('username');
                              this.answer.profilePic = doc.get('profilePic');
                          } else {
                              this.currentAnon = true;
                              this.answer.username = 'Anonymous';
                              this.answer.profilePic = this.anonPic;
                          }
                          this.answer.timestamp = firebase.firestore.FieldValue.serverTimestamp();

                          this.questionService.addAnswer(this.answer).then(() => {
                              this.showToast('Answer added');
                              this.answerForm.reset();
                              this.showAnswerBox = false;
                          }, err => {
                              this.showToast('There was a problem adding your answer');
                          });

                      });
                  });
              }
          });
      }
  }

  showToast(msg) {
    this.toastCtrl.create({
      message: msg,
      duration: 2000
    }).then(toast => toast.present());
  }

  displayAnswerBox() {
    this.showAnswerBox = true;
  }

  goToProfile(userID: string, questionID: string) {
      this.router.navigate(['/viewable-profile/', userID]);
      this.storage.set('currentPost', questionID);
      this.storage.set('currentLoc', 'forum/forum-thread');
  }

    scrollToBottom() {
        setTimeout(() => {
            if (this.content.scrollToBottom) {
                this.content.scrollToBottom(100);
            }
        }, 500);
    }

    getAutoProfilePic() {
        firebase.firestore().collection('settings').doc('userSignUpSettings').get().then((result) => {
            this.anonPic = result.get('autoProfilePic');
        });
    }

}
