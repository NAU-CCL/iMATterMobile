import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { AnalyticsService, Analytics, Sessions  } from 'src/app/services/analyticsService.service';
import * as firebase from 'firebase/app';
import {AngularFirestore} from '@angular/fire/firestore';
import {Observable} from 'rxjs';


@Component({
  selector: 'app-more',
  templateUrl: './more.page.html',
  styleUrls: ['./more.page.scss'],
})

export class MorePage implements OnInit {


  analytic: Analytics =
  {
    page: '',
    userID: '',
    timestamp: '',
    sessionID: ''
  }

  session : Sessions =
      {
          userID: '',
          LogOutTime: '',
          LoginTime: '',
          numOfClickChat: 0,
          numOfClickCalendar: 0,
          numOfClickLModule: 0,
          numOfClickInfo: 0,
          numOfClickSurvey: 0,
          numOfClickProfile: 0,
          numOfClickMore: 0,
          numOfClickHome: 0
      }

  private analyticss : string;
  private sessions : Observable<any>;


  constructor(private router: Router,
              private  storage: Storage,
              private afs: AngularFirestore,
              private analyticsService: AnalyticsService) {
    this.storage.get('userCode').then((val) => {
      if (!val) {
        this.router.navigate(['/access-denied']);
      }
    });
  }

  ngOnInit() {
    this.storage.get('authenticated').then((val) => {
      if (val === 'false') {
        this.router.navigate(['/login/']);
      }
    });

     this.addView();
  }



  updateInfoClicks()
  {
    this.analyticsService.updateInfoClicks(this.session);
    console.log("added info click");

  }


  addView(){
  this.storage.get('userCode').then((val) =>{
    if (val) {
      const ref = this.afs.firestore.collection('users').where('code', '==', val);
      ref.get().then((result) =>{
        result.forEach(doc =>{
          this.analytic.page = 'morePage';
          this.analytic.userID = val;
          this.analytic.timestamp = firebase.firestore.FieldValue.serverTimestamp();
          //this.analytic.sessionID = this.idReference;
          this.analyticsService.addView(this.analytic).then (() =>{
            console.log('successful added view: morePage');

          }, err =>{
            console.log('unsucessful added view: morePage');

          });
        });
      });
    }
  });
}

}
