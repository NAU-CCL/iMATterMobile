import { Component, OnInit } from '@angular/core';
import { LearningModuleService, LearningModule } from '../../services/learningModule/learning-module.service';
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

  //user's code
  userCode;

  //Arrays to keep track of which modules have been viewed
  newModules = [];
  viewedModules = [];

  takenQuizModules = new Map();

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
    //empty these every time so duplicates don't show up
    this.newModules = [];
    this.viewedModules = [];
    this.takenQuizModules.clear();

    this.learningModules.forEach(value => {
      value.forEach(singleMod => {

        //Filter down to only the modules that should be visible to this user
        if (singleMod.userVisibility.includes(this.userCode) && singleMod.moduleActive)
        {
          //see if this module has been viewed
          this.storage.get(singleMod.id + "beenViewed").then(value => {
            if (value == true) //have viewed this module
            {
              this.viewedModules.push(singleMod.id);
            }
            else if (value === null) //have not viewed
            {
              this.newModules.push(singleMod.id);
            }
          }).catch(e => {
              
            console.log('error retrieving beenViewed: '+ e);
            
          });

          //If this module has quiz questions
          if (singleMod.moduleQuiz.length > 0)
          {
            //Get this LM's numberTimesQuizTaken from local storage
            this.storage.get(singleMod.id + "numberTimesQuizTaken").then(value => {
        
              if (value != null) //they've taken quiz already
              {
                this.takenQuizModules.set(singleMod.id, value);
              }
              else //they haven't taken quiz, value == null
              {
                //since value is null, need to set this one to 0
                this.takenQuizModules.set(singleMod.id, 0);
              }
    
              }).catch(e => {
              
              console.log('error retrieving numberTimesQuizTaken: '+ e);
              
              });
          }
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
