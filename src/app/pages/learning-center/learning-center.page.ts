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

  //Arrays to keep track of which modules have been viewed
  newModules = [];
  viewedModules = [];
  takenQuizModules = new Map();

  lmRecurrenceMap = new Map();

  private learningModules: Observable<LearningModule[]>;

  constructor(private router: Router,
     private storage: Storage,
     private learningModService: LearningModuleService,
     private afs: AngularFirestore,
     private analyticsService: AnalyticsService) { }

  ngOnInit() 
  {
    this.storage.get('authenticated').then((val) => {
      if (val === 'false') {
        this.router.navigate(['/login/']);
      }
    });

    this.learningModules = this.learningModService.getAllLearningModules();

    //UserCode
    this.storage.get("userCode").then(value => {
      if (value != null)
      {
        this.userCode = value;
        console.log('userCode: '+ this.userCode);
      }

      //IMPORTANT: this line is an error fix for modules not showing up
      //Need to wait for userCode to be initialized before ionViewWillEnter is executed
      this.ionViewWillEnter();

      }).catch(e => {

      console.log('error retrieving userCode: '+ e);

      });

    this.addView();

  }

  ionViewWillEnter()
  {
    //don't continue until userCode has been initialized
    if (this.userCode === undefined)
    {
      return;
    }
 
    //this.initializeStorageforLM();

    //reset these every time so duplicates don't show up
    this.newModules = [];
    this.viewedModules = [];
    this.takenQuizModules.clear();

    this.learningModules.forEach(value => {
      value.forEach(singleMod => {

        //Filter down to only the modules that should be visible to this user
        if (singleMod.userVisibility.includes(this.userCode) && singleMod.moduleActive)
        {
          //var storedPrevUV = this.lmRecurrenceMap.get(singleMod.id + "storedPrevUV");
          //var storedCurrentUV = this.lmRecurrenceMap.get(singleMod.id + "storedCurrentUV");
          //var storedDate = this.lmRecurrenceMap.get(singleMod.id + "storedDate");
          //this.checkNewRecurring(singleMod, storedPrevUV, storedCurrentUV, storedDate);

          //see if this module has been viewed
          this.storage.get(singleMod.id + "beenViewed").then(value => {
            if (value === true) //have viewed this module
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

  initializeStorageforLM()
  {
    console.log("in here");

    this.learningModules.forEach(value => {
      value.forEach(singleMod => {

        console.log("entered here");
        if (singleMod.userVisibility.includes(this.userCode) && singleMod.moduleActive)
        {
          console.log("entered entered");
          this.storage.get(singleMod.id + "storedPrevUV").then(value => {

            if (value != null)
            {
              this.lmRecurrenceMap.set(singleMod.id + "storedPrevUV", value);
            }
            else
            {
              this.lmRecurrenceMap.set(singleMod.id + "storedPrevUV", null);
            }
  
            console.log("storedPrevUV: " + this.lmRecurrenceMap.get(singleMod.id + "storedPrevUV"));
            
          }).catch(e => {
            
            console.log('error retrieving storedPrevUV: '+ e);
            
            });
  
          this.storage.get(singleMod.id + "storedCurrentUV").then(value => {
  
            if (value != null)
            {
              this.lmRecurrenceMap.set(singleMod.id + "storedCurrentUV", value);
            }
            else
            {
              this.lmRecurrenceMap.set(singleMod.id + "storedCurrentUV", null);
            }
  
            console.log("storedCurrentUV: " + this.lmRecurrenceMap.get(singleMod.id + "storedCurrentUV"));
            
          }).catch(e => {
            
            console.log('error retrieving storedCurrentUV: '+ e);
            
            });
  
          this.storage.get(singleMod.id + "localUVStoreDate").then(value => {
  
            if (value != null)
            {
              this.lmRecurrenceMap.set(singleMod.id + "storedDate", value);
            }
            else
            {
              this.lmRecurrenceMap.set(singleMod.id + "storedPrevUV", null);
            }
  
            console.log("localUVStoreDate: " + this.lmRecurrenceMap.get(singleMod.id + "storedDate"));
            
          }).catch(e => {
            
            console.log('error retrieving localUVStoreDate: '+ e);
            
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


  checkNewRecurring(currentMod:LearningModule, previousUserVisibility:Array<string>, currentUserVisibility:Array<string>, storedDate: string)
  {
    console.log("NOW CHECKING: " + currentMod.moduleTitle);
    console.log("CURRENT UV: " + currentMod.userVisibility);
    console.log("PREV UV: " + currentMod.previousUserVisibility);

    console.log("STORED CURRENT: " + currentUserVisibility);
    console.log("STORED PRE: " + previousUserVisibility);
    console.log("STORED DATE: " + storedDate);
    //This module has never appeared before for this user, don't need to check for recurrence
    if (previousUserVisibility === null && currentUserVisibility === null && storedDate === null)
    {
      return;
    }
    else
    {
      var getDate = new Date();
      var currentDate = getDate.getMonth() + "/" + getDate.getDate() + "/"+ getDate.getFullYear();
      console.log("DATE: " + currentDate);

      console.log("PREVS EQUAL: " + this.arraysEqual(currentMod.previousUserVisibility, previousUserVisibility));
      console.log("CURRENTS EQUAL: " + this.arraysEqual(currentMod.userVisibility, currentUserVisibility));
      console.log("DATES EQUAL: " + (storedDate === currentDate));

      //we're rechecking something that's already been checked
      if (this.arraysEqual(currentMod.previousUserVisibility, previousUserVisibility) 
        && this.arraysEqual(currentMod.userVisibility, currentUserVisibility)
        && (storedDate === currentDate))
      {
        console.log("entering here");
        return;
      }
      else
      {
        var newlyVisible = currentMod.userVisibility.filter(item => currentMod.previousUserVisibility.indexOf(item) < 0);
        console.log("NEWLY VISIBLE: ");
        console.log(newlyVisible);
  
        //if this module is 
        if (newlyVisible.includes(this.userCode))
        {
          this.clearLMStorage(currentMod.id);
        }

        this.storage.set(currentMod.id + "storedPrevUV", currentMod.previousUserVisibility);
        this.storage.set(currentMod.id + "storedCurrentUV", currentMod.userVisibility);
        this.storage.set(currentMod.id + "localUVStoreDate", currentDate);
      }
    }


  }

  /**
   * Takes two arrays, checks if their contents are equal
   * Order matters
   */
  arraysEqual(arrayOne, arrayTwo): boolean
  {
    if (arrayOne === arrayTwo) 
    {
      return true;
    }
    else if (arrayOne.length === 0 && arrayTwo.length === 0)
    {
      return true;
    }
    else if (arrayOne.length != arrayTwo.length)
    {
      return false;
    }
    else if (arrayOne === null || arrayTwo === null)
    {
      return false;
    }
    else
    {
      for (var index = 0; index < arrayOne.length; index++)
      {
        if (arrayOne[index] !== arrayTwo[index])
        {
          return false;
        }
        return true;
      }
    }
  }

  //used to clear a given LM's local storage
  clearLMStorage(learningModID:string)
  {
    console.log("CLEARING STORAGE!!");
    this.storage.remove(learningModID + "videoHasEnded");
    this.storage.remove(learningModID + "numberTimesQuizTaken");
    this.storage.remove(learningModID + "numberQuestionsCorrect");
    this.storage.remove(learningModID + "didSubmit");
    this.storage.remove(learningModID + "correctQuestions");
    this.storage.remove(learningModID + "previousQuizAttemptPoints");
    this.storage.remove(learningModID + "currentQuizPoints");
    this.storage.remove(learningModID + "beenViewed");
    this.storage.remove(learningModID + "storedPrevUV");
    this.storage.remove(learningModID + "storedCurrentUV");
    this.storage.remove(learningModID + "localUVStoreDate");
  }

}
