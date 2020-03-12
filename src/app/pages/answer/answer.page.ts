import { Component, OnInit } from '@angular/core';
import { FireService, Survey } from 'src/app/services/survey/fire.service';
import { ActivatedRoute, Router } from '@angular/router';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { ProfileService } from 'src/app/services/user/profile.service';
import { Storage} from '@ionic/storage';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-answer',
  templateUrl: './answer.page.html',
  styleUrls: ['./answer.page.scss'],
})
export class AnswerPage implements OnInit {
  survey: Survey = {
    title: '',
    surveyLink: '',
    type: '',
    daysTillRelease: '',
    daysBeforeDueDate: '',
    daysTillExpire: 0,
    daysInactive: 0,
    emotionChosen: '',
    pointsWorth: 0,
    userVisibility: [],
    surveyDescription: '',
  }

  isDisabled = true;
  userPoints;
  userCode;
  data;
  userTakenArrays;
  
  constructor(private activatedRoute: ActivatedRoute, 
              private fs: FireService,
              private browser: InAppBrowser,
              private router: Router,
              private profile: ProfileService,
              private storage: Storage,
              public afs: AngularFirestore
              ) { }

  ngOnInit() {
    this.storage.get('authenticated').then((val) => {
      if (val === 'false') {
        this.router.navigate(['/login/']);
      }
    });
    this.data = this.activatedRoute.snapshot.paramMap.get('id');
    
    let id = this.data.split(":")[0];

    if(id){
      this.fs.getSurvey(id).subscribe(survey => {
        this.survey = survey;
      });
    }

    this.storage.get('userCode').then((val) => {
      if (val) {
        const ref = this.afs.firestore.collection('users').where('code', '==', val);
        ref.get().then((result) => {
          result.forEach(doc => {
            this.userPoints = doc.get('points');
            this.userCode = doc.get('code');
            this.userTakenArrays = doc.get('answeredSurveys');
          });
        });
      }
    });

  }

  openPage(url: string) {
    const options: InAppBrowserOptions = {
      hideurlbar: 'yes'
    }
    this.browser.create(url, `_blank`, options);
    this.isDisabled = false;
  }

  submit(){
    let includes = false;

    if(this.userTakenArrays.length != 0){
      this.userTakenArrays.forEach(taken =>{
        if(taken.split(":")[0].includes(this.survey.id)){
          includes = true;
          this.userTakenArrays[this.userTakenArrays.indexOf(taken)] = this.data;
          console.log(this.userTakenArrays)
          this.fs.updateAnsweredSurveys(this.userCode, this.userTakenArrays);
        }
      })
    }

    if(this.userTakenArrays.length == 0 || !includes){
      this.userTakenArrays.push(this.data)
      console.log(this.userTakenArrays)
      this.fs.updateAnsweredSurveys(this.userCode, this.userTakenArrays);
    }

    let newPointValue = this.userPoints + this.survey.pointsWorth;
    this.profile.editRewardPoints(newPointValue, this.userCode);
    this.router.navigateByUrl('/available');
  }
}