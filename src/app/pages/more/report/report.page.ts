import { Component, OnInit } from '@angular/core';
import { Submission, UserSubmissionsService } from '../../../services/userSubmissions/user-submissions.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import * as firebase from 'firebase/app';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-report',
  templateUrl: './report.page.html',
  styleUrls: ['./report.page.scss'],
})
export class ReportPage implements OnInit {

  submission: Submission = {
    title: '',
    description: '',
    username: '',
    userID: '',
    timestamp: '',
    type: '',
    operatingSys: '',
    version: ''
  };

  private reportForm: FormGroup;

  constructor(private afs: AngularFirestore,
              private activatedRoute: ActivatedRoute,
              private userSubmissionService: UserSubmissionsService,
              private toastCtrl: ToastController,
              private router: Router,
              private storage: Storage,
              private formBuilder: FormBuilder) {

    this.reportForm = this.formBuilder.group({
      subject: ['',
        Validators.compose([Validators.required, Validators.minLength(1)])],
      description: ['',
        Validators.compose([Validators.required, Validators.minLength(1)])],
    });
  }

  ngOnInit() {
    this.storage.get('authenticated').then((val) => {
      if (val === 'false') {
        this.router.navigate(['/login/']);
      }
    });
  }

  submitSubmission(submissionForm: FormGroup) {

    this.storage.get('platform').then((val) => {
      if (val) {
        this.submission.operatingSys = val;
      }
    });


    this.storage.get('userCode').then((val) => {
      if (val) {
        const ref = this.afs.firestore.collection('users').where('code', '==', val);
        ref.get().then((result) => {
          result.forEach(doc => {
            this.submission.title = submissionForm.value.subject;
            this.submission.description = submissionForm.value.description;
            this.submission.userID = val;
            this.submission.timestamp = firebase.firestore.FieldValue.serverTimestamp();
            this.submission.username = doc.get('username');
            this.submission.type = 'Problem';

            this.userSubmissionService.addSubmission(this.submission).then(() => {
              this.router.navigateByUrl('/more');
              this.showToast('Report sent');
              this.submission.title = '';
              this.submission.description = '';
            }, err => {
              this.showToast('There was a problem sending your problem report');
            });
          });
        });
      }
    });
  }

  showToast(msg) {
    this.toastCtrl.create({
      message: msg,
      duration: 2000
    }).then(toast => toast.present());
  }

}
