import { Component, OnInit } from '@angular/core';
import { Report, UserSubmissionsService } from '../../../services/userSubmissions/user-submissions.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import * as firebase from 'firebase/app';
import { Device } from '@ionic-native/device/ngx';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-report',
  templateUrl: './report.page.html',
  styleUrls: ['./report.page.scss'],
})
export class ReportPage implements OnInit {

  report: Report = {
    title: '',
    description: '',
    username: '',
    userID: '',
    timestamp: '',
    type: '',
    operatingSys: '',
    version: '',
    viewed: false
  };

  public reportForm: FormGroup;

  constructor(private afs: AngularFirestore,
              private activatedRoute: ActivatedRoute,
              private userSubmissionService: UserSubmissionsService,
              private toastCtrl: ToastController,
              private router: Router,
              private storage: Storage,
              private formBuilder: FormBuilder,
              private device: Device
              ) {

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
        this.report.operatingSys = val + ' ' + this.device.model;
      }
    });


    this.storage.get('userCode').then((val) => {
      if (val) {
        const ref = this.afs.firestore.collection('users').where('code', '==', val);
        ref.get().then((result) => {
          result.forEach(doc => {
            this.report.title = submissionForm.value.subject;
            this.report.description = submissionForm.value.description;
            this.report.userID = val;
            this.report.timestamp = firebase.firestore.FieldValue.serverTimestamp();
            this.report.username = doc.get('username');
            this.report.type = 'Problem';
            this.report.version = this.device.version;

            this.userSubmissionService.addReport(this.report).then(() => {
              this.router.navigateByUrl('/tabs/more');
              this.showToast('Report sent');
              this.report.title = '';
              this.report.description = '';
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
