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

   //Weeks Pregnant of user (to display correct modules to them)
   userWeeksPregnant;

   //Total days pregnant of user (to calculate which learning modules should be visible to them)
   userTotalDaysPregnant;

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

      //WeeksPregnant
    this.storage.get("totalDaysPregnant").then(value => {
      if (value != null)
      {
        this.userTotalDaysPregnant = value;
        console.log('totalDaysPregnant: '+ this.userTotalDaysPregnant);
        //convert to string to be able to use in *ngIf in HTML
        this.userTotalDaysPregnant = Number(this.userTotalDaysPregnant);
      }

      }).catch(e => {

      console.log('error retrieving totalDaysPregnant: '+ e);

      });

      this.addView();
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

//Checks to see if a given module should be displayed to the user
//Returns boolean
/*displayToUser(moduleVisibility, moduleExpiration)
{
  console.log("in displayToUser");
  console.log("moduleVisibility: " + moduleVisibility);
  console.log("moduleExpiration: " + moduleExpiration);

  moduleVisibility = moduleVisibility.toString().split(/(?:,| )+/);
  console.log("moduleVisibility AFTER SPLIT: ");
  console.log(moduleVisibility);

  var daysStart;
  var daysEnd;
  for (var index = 0; index < moduleVisibility.length; index++)
  {
    console.log("Module visibility length: " + moduleVisibility.length);
    console.log("INDEX: " + index);
    console.log("WEEK: " + moduleVisibility[index]);
    //if module is always to be displayed
    if (moduleVisibility[index] == 0)
    {
      return true;
    }
    else
    {
      daysStart = 7 * moduleVisibility[index];
      console.log("DAYS START: " + daysStart);
      //if module is to never expire
      if (moduleExpiration == 0)
      {
        daysEnd = daysStart + 100000;
      }
      else
      {
        daysEnd = daysStart + moduleExpiration;
      }

      console.log("DAYS END: " + daysEnd); 

      if (this.userTotalDaysPregnant >= daysStart && this.userTotalDaysPregnant <= daysEnd)
      {
        return true;
      }
    }
  }
  return false;
}*/

}
