import { Component, OnInit } from '@angular/core';
import { LearningModuleService, LearningModule } from '../../services/learning-module.service';
import { AnalyticsService, Analytics, Sessions  } from 'src/app/services/analyticsService.service';
import { Observable } from 'rxjs';
import { Storage} from '@ionic/storage';
import * as firebase from 'firebase/app';
import {AngularFirestore} from '@angular/fire/firestore';
import { Router } from '@angular/router';


@Component({
  selector: 'app-learning-center',
  templateUrl: './learning-center.page.html',
  styleUrls: ['./learning-center.page.scss'],
})
export class LearningCenterPage implements OnInit {

    analytic: Analytics =
  {
    page: '',
    userID: '',
    timestamp: '',
    sessionID: ''
  }

   //Weeks Pregnant of user (to display correct modules to them)
   userWeeksPregnant;

  private learningModules: Observable<LearningModule[]>;

  constructor(private router: Router,
     private storage: Storage,
     private learningModService: LearningModuleService,
     private afs: AngularFirestore,
     private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.storage.get('authenticated').then((val) => {
      if (val === 'false') {
        this.router.navigate(['/login/']);
      }
    });
    this.learningModules = this.learningModService.getAllLearningModules();

    //WeeksPregnant
    this.storage.get("weeksPregnant").then(value => {
      if (value != null)
      {
        this.userWeeksPregnant = value;
        console.log('userweekspregnant: '+ this.userWeeksPregnant);
        //convert to string to be able to use in *ngIf in HTML
        this.userWeeksPregnant = this.userWeeksPregnant.toString();
      }

      }).catch(e => {

      console.log('error retrieving userweekspregnant: '+ e);

      });

      this.addView();
  }




  addView(){

  //this.analytic.sessionID = this.session.id;
  this.storage.get('userCode').then((val) =>{
    if (val) {
      const ref = this.afs.firestore.collection('users').where('code', '==', val);
      ref.get().then((result) =>{
        result.forEach(doc =>{
          this.analytic.page = 'learningModule';
          this.analytic.userID = val;
          this.analytic.timestamp = firebase.firestore.FieldValue.serverTimestamp();
          //this.analytic.sessionID = this.idReference;
          this.analyticsService.addView(this.analytic).then (() =>{
            console.log('successful added view: learningModules');

          }, err =>{
            console.log('unsucessful added view: learningModules');

          });
        });
      });
    }
  });
}


}
