import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionService, Question } from 'src/app/services/infoDesk/question.service';
import { ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import {Observable} from 'rxjs';
import {AngularFirestore} from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import FieldValue = firebase.firestore.FieldValue;
import { HttpClient } from '@angular/common/http';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';


@Component({
  selector: 'app-forum-deatails',
  templateUrl: './forum-deatails.page.html',
  styleUrls: ['./forum-deatails.page.scss'],
})
export class ForumDeatailsPage implements OnInit {

  question: Question = {
    title: '',
    description: '',
    username: '',
    userID: '',
    timestamp: FieldValue,
    profilePic: '',
    anon: false,
    type: '',
    numOfComments: 0,
    commenters: []
  };

  public anon: boolean;
  public questionForm: FormGroup;

  constructor(private afs: AngularFirestore,
              private activatedRoute: ActivatedRoute,
              private questionService: QuestionService,
              private toastCtrl: ToastController,
              private router: Router,
              private storage: Storage,
              private http: HttpClient,
              private formBuilder: FormBuilder) {

    this.questionForm = this.formBuilder.group({
      title: ['',
        Validators.compose([Validators.required, Validators.minLength(1)])],
      description: ['',
        Validators.compose([Validators.required, Validators.minLength(1)])],
      anon: [false,
        Validators.compose([Validators.required])],
    });
  }

  ngOnInit() {
    this.storage.get('authenticated').then((val) => {
      if (val === 'false') {
        this.router.navigate(['/login/']);
      }
    });
  }

  addQuestion(questionForm: FormGroup) {
    if (!questionForm.valid) {
      this.showToast('Please enter a title and question');
    } else {
      this.question.type = 'user';
      this.question.title = questionForm.value.title;
      this.question.description = questionForm.value.description;
      if (questionForm.value.anon) {
        this.question.anon = this.questionForm.value.anon;
      }
      this.storage.get('userCode').then((val) => {
        if (val) {
          const ref = this.afs.firestore.collection('users').where('code', '==', val);
          ref.get().then((result) => {
            result.forEach(doc => {
              this.question.userID = val;
              this.question.timestamp = firebase.firestore.FieldValue.serverTimestamp();

              if (!this.question.anon) {
                this.question.username = doc.get('username');
                this.question.profilePic = doc.get('profilePic');
              } else {
                this.question.username = 'Anonymous';
                this.question.profilePic = 'https://firebasestorage.googleapis.com/v0/b/techdemofirebase.appspot.com/o/ProfileImages%2Fauto.png?alt=media&token=e5601f32-30f8-4b38-9a2c-ff2d7e6ad59a';
              }

              this.questionService.addQuestion(this.question).then(() => {
                this.router.navigateByUrl('/tabs/more/forum');
                this.showToast('Question posted');
                this.questionForm.reset();
              }, err => {
                this.showToast('There was a problem adding your post');
              });

            });
          });
        }
      });
    }
  }

  deleteQuestion() {
    this.questionService.deleteQuestion(this.question.id).then(() => {
      this.router.navigateByUrl('/');
      this.showToast('Question deleted');
    }, err => {
      this.showToast('');
    });
  }

  updateQuestion() {
    this.questionService.updateQuestion(this.question).then(() => {
      this.showToast('');
    }, err => {
      this.showToast('');
    });
  }

  showToast(msg) {
    this.toastCtrl.create({
      message: msg,
      duration: 2000
    }).then(toast => toast.present());
  }

  sendEmail(questionForm: FormGroup) {
    if (questionForm.valid) {
      this.http.get('https://us-central1-imatter-nau.cloudfunctions.net/sendEmailNotification').subscribe((response) => {
        console.log(response);
      });
    }
	}
}
