import { Component, OnInit } from '@angular/core';
import { LearningModuleService, LearningModule } from '../../services/learningModule/learning-module.service';
import { AnalyticsService, Analytics, Sessions  } from 'src/app/services/analyticsService.service';
import { Observable } from 'rxjs';
import { Storage} from '@ionic/storage';
import * as firebase from 'firebase/app';
import {AngularFirestore} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { single } from 'rxjs/operators';


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

  //user's code
  userCode;

  //Arrays to keep track of which modules are new and which are taken
  newModules = [];
  takenModules = [];

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
    this.storage.get("userCode").then(value => {
      if (value != null)
      {
        this.userCode = value;
        console.log('userCode: '+ this.userCode);
      }

      }).catch(e => {

      console.log('error retrieving userCode: '+ e);

      });

    this.addView();

  }

  ionViewWillEnter()
  {
    this.newModules = [];
    this.takenModules = [];

    this.learningModules.forEach(value => {
      value.forEach(singleMod => {

        //Filter down to only the modules that should be visible to this user
        if (singleMod.userVisibility.includes(this.userCode) && singleMod.moduleActive)
        {
          //Get this LM's numberTimesQuizTaken from local storage
          this.storage.get(singleMod.id + "numberTimesQuizTaken").then(value => {
      
            if (value != null) //they've taken quiz already
            {
              this.takenModules.push(singleMod.id);
            }
            else //quiz has not been taken
            {
              this.newModules.push(singleMod.id);
            }
  
            }).catch(e => {
            
            console.log('error retrieving numberTimesQuizTaken: '+ e);
            
            });
        }
      });
    });
  }


  
  
  addView()
  {

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
