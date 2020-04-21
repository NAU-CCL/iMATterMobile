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

  //used for keeping track of recurring modules
  lmRecurrenceMap = new Map();

  private learningModules: Observable<LearningModule[]>;

  constructor(private router: Router,
     private storage: Storage,
     private learningModService: LearningModuleService,
     private afs: AngularFirestore,
     private analyticsService: AnalyticsService) { }

  ngOnInit() 
  {
    console.log("NG ON INIT");

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

        //IMPORTANT: this line is an error fix for modules not showing up
        //Need to wait for userCode to be initialized before ionViewWillEnter is executed
        this.ionViewWillEnter();
      }

      }).catch(e => {

      console.log('error retrieving userCode: '+ e);

      });

    this.addView();

  }

  ionViewWillEnter()
  {
    //don't continue until userCode is initialized
    if (this.userCode === undefined)
    {
      return;
    }
    
    console.log("ION VIEW WILL ENTER");

    //IMPORTANT: does everything related to checking recurrences
    this.initStorageCheckRecurrence();

    //reset these every time so duplicates don't show up
    this.newModules = [];
    this.viewedModules = [];
    this.takenQuizModules.clear();

    this.learningModules.forEach(value => {
      value.forEach(singleMod => {

        //Filter down to only the modules that should be visible to this user
        if (singleMod.userVisibility.includes(this.userCode) && singleMod.moduleActive)
        {
          //check if this module has been viewed
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

  /**
   * initializes storage used for checking learning module recurrence
   * stores the local storage info into lmRecurrenceMap to be accessed later
   * calls checkNewRecurring function to check each module
   */
  initStorageCheckRecurrence()
  {
    this.learningModules.forEach(value => {
      value.forEach(singleMod => {

        //only check modules that are currently visible to user
        if (singleMod.userVisibility.includes(this.userCode) && singleMod.moduleActive)
        {
          //storedPrevUV = previous user visibility array for this module
          this.storage.get(singleMod.id + "storedPrevUV").then(value => {

            if (value != null)
            {
              this.lmRecurrenceMap.set(singleMod.id + "storedPrevUV", value);
            }
            else //module has not ever appeared for this user
            {
              this.lmRecurrenceMap.set(singleMod.id + "storedPrevUV", null);
            }

          }).catch(e => {
            
            console.log('error retrieving storedPrevUV: '+ e);
            
            });
  
          //storedCurrentUV = current user visibility array for this module
          this.storage.get(singleMod.id + "storedCurrentUV").then(value => {

  
            if (value != null)
            {
              this.lmRecurrenceMap.set(singleMod.id + "storedCurrentUV", value);
            }
            else
            {
              this.lmRecurrenceMap.set(singleMod.id + "storedCurrentUV", null);
            }
            
          }).catch(e => {
            
            console.log('error retrieving storedCurrentUV: '+ e);
            
            });
  
          //localUVStoreDate = the date that recurrence was last updated
          this.storage.get(singleMod.id + "localUVStoreDate").then(value => {
  
            
            if (value != null)
            {
              this.lmRecurrenceMap.set(singleMod.id + "storedDate", value);
            }
            else
            {
              this.lmRecurrenceMap.set(singleMod.id + "storedDate", null);
            }

            //IMPORTANT: check this module for a new recurrence
            //Note: this call was moved here as a fix for a local storage issue where the values above weren't being initialized in time
            //This function call used to be in ionViewWillEnter()
            this.checkNewRecurring(singleMod);
            
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


  /**
   * Checks to see if a given learning module is showing up as a new recurrence
   * Example: moduleA showed up in week 34 for 5 days and it's now week 38 and it's showing up again
   * If so, then clear the local storage for that learning module so it appears as a new module
   * @param currentMod the module we're checking
   */
  checkNewRecurring(currentMod:LearningModule)
  {
    var previousUserVisibility = this.lmRecurrenceMap.get(currentMod.id + "storedPrevUV");
    var currentUserVisibility = this.lmRecurrenceMap.get(currentMod.id + "storedCurrentUV");
    var storedDate = this.lmRecurrenceMap.get(currentMod.id + "storedDate");

    //Get the current date and put it in MM/DD/YYYY format
    var getDate = new Date();
    var currentDate = getDate.getMonth() + "/" + getDate.getDate() + "/"+ getDate.getFullYear();

    //This module has never appeared before for this user, don't need to check for recurrence
    if (previousUserVisibility === null && currentUserVisibility === null && storedDate === null)
    {
      //set these values to what they currently are in the database and move on
      this.storage.set(currentMod.id + "storedPrevUV", currentMod.previousUserVisibility);
      this.storage.set(currentMod.id + "storedCurrentUV", currentMod.userVisibility);
      this.storage.set(currentMod.id + "localUVStoreDate", currentDate);

      return;
    }
    else
    {
      //if this module's recurrence has already been checked and local storage was cleared for it
      if ((JSON.stringify(currentMod.previousUserVisibility) === JSON.stringify(previousUserVisibility)) 
        && (JSON.stringify(currentMod.userVisibility) === JSON.stringify(currentUserVisibility))
        && (storedDate === currentDate))
      {
        return;
      }
      else //we're checking it for the first time for this recurrence
      {
        var newlyVisible;

        //get a list of users who weren't in the previousUserVisibility array but are in userVisibility
        newlyVisible = currentMod.userVisibility.filter(item => currentMod.previousUserVisibility.indexOf(item) < 0);
  
        //if this module is a newly appearing module for a user, clear the local storage
        if (newlyVisible.includes(this.userCode))
        {
          this.clearLMStorage(currentMod.id);
        }

        //update these values 
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
