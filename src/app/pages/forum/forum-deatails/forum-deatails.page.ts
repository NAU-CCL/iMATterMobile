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
    type: ''
  };

  private anon: boolean;

  constructor(private afs: AngularFirestore, private activatedRoute: ActivatedRoute, private questionService: QuestionService,
              private toastCtrl: ToastController, private router: Router, private storage: Storage, private http: HttpClient) {
  }

  ngOnInit() {
    this.storage.get('authenticated').then((val) => {
      if (val === 'false') {
        this.router.navigate(['/login/']);
      }
    });
  }

  addQuestion() {
    this.question.type = 'user';
    if (this.anon) {
      this.question.anon = this.anon;
    }
    console.log(this.question.anon);
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
              this.router.navigateByUrl('/forum');
              this.showToast('Question posted');
              this.question.title = '';
              this.question.description = '';
            }, err => {
              this.showToast('There was a problem adding your post');
            });

          });
        });
      }
    });





  }

  deleteQuestion() {
    this.questionService.deleteQuestion(this.question.id).then(() => {
      this.router.navigateByUrl('/');
      this.showToast('Question deleted');
    }, err => {
      this.showToast('There was a problem deleting your post :(');
    });
  }

  updateQuestion() {
    this.questionService.updateQuestion(this.question).then(() => {
      this.showToast('Idea updated');
    }, err => {
      this.showToast('There was a problem updating your idea :(');
    });
  }

  showToast(msg) {
    this.toastCtrl.create({
      message: msg,
      duration: 2000
    }).then(toast => toast.present());
  }
  sendEmail(){
	this.http.get('https://us-central1-techdemofirebase.cloudfunctions.net/sendEmailNotification').subscribe((response) => {
		console.log(response);
	});
	}
}
