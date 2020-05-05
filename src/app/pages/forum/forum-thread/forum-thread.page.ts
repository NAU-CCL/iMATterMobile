import {Component, OnInit, ViewChild} from '@angular/core';
import { QuestionService, Question, Comment } from 'src/app/services/infoDesk/question.service';
import {ActivatedRoute, Router} from '@angular/router';
import {IonContent, ToastController} from '@ionic/angular';
import { Storage } from '@ionic/storage';
import {Observable} from 'rxjs';
import {AngularFirestore} from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import FieldValue = firebase.firestore.FieldValue;
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
    timestamp: FieldValue,
    profilePic: '',
    anon: false,
    type: '',
    numOfComments: 0,
    commenters: []
  };

  comment: Comment = {
    input: '',
    username: '',
    postID: '',
    userID: '',
    timestamp: FieldValue,
    profilePic: '',
    anon: false,
    type: ''
  };

    public showCommentBox: boolean = false;
    public anon: boolean;
    public currentAnon: boolean;
    public comments: Observable<any>;
    public commentForm: FormGroup;

  constructor(private afs: AngularFirestore,
              private activatedRoute: ActivatedRoute,
              private questionService: QuestionService,
              private toastCtrl: ToastController,
              private router: Router,
              private storage: Storage,
              private formBuilder: FormBuilder) {

      this.commentForm = this.formBuilder.group({
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
          this.comments = this.questionService.getComments(id);
      }
  }

  addComment(commentForm: FormGroup) {
      this.scrollToBottom();
      if (!commentForm.valid) {
          this.showToast('Please enter a comment');
      } else {
          this.comment.type = 'user';
          this.comment.anon = commentForm.value.anon;
          this.comment.postID = this.question.id;
          this.comment.input = commentForm.value.comment;
          this.storage.get('userCode').then((val) => {
              if (val) {
                  const ref = this.afs.firestore.collection('users').where('code', '==', val);
                  ref.get().then((result) => {
                      result.forEach(doc => {

                          this.comment.userID = val;

                          if (!this.comment.anon) {
                              this.currentAnon = false;
                              this.comment.username = doc.get('username');
                              this.comment.profilePic = doc.get('profilePic');
                          } else {
                              this.currentAnon = true;
                              this.comment.username = 'Anonymous';
                              this.comment.profilePic = 'https://firebasestorage.googleapis.com/v0/b/techdemofirebase.appspot.com/o/ProfileImages%2Fauto.png?alt=media&token=e5601f32-30f8-4b38-9a2c-ff2d7e6ad59a';
                          }
                          this.comment.timestamp = firebase.firestore.FieldValue.serverTimestamp();

                          this.questionService.addComment(this.comment).then(() => {
                              this.showToast('Comment added');
                              this.commentForm.reset();
                              this.showCommentBox = false;
                          }, err => {
                              this.showToast('There was a problem adding your comment');
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

  displayCommentBox() {
    this.showCommentBox = true;
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


}
