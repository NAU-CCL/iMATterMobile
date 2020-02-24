import { Component, OnInit } from '@angular/core';
import { FireService, Survey } from 'src/app/services/survey/fire.service';
import { ActivatedRoute, Router } from '@angular/router';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';

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
  }

  isDisabled = true;
  
  constructor(private activatedRoute: ActivatedRoute, 
              private fs: FireService,
              private browser: InAppBrowser,
              private router: Router
              ) { }

  ngOnInit() {
    let id = this.activatedRoute.snapshot.paramMap.get('id');

    if(id){
      this.fs.getSurvey(id).subscribe(survey => {
        this.survey = survey;
      });
    }
  }

  openPage(url: string) {
    const options: InAppBrowserOptions = {
      hideurlbar: 'yes'
    }
    this.browser.create(url, `_blank`, options);
    this.isDisabled = false;
  }

  submit(){
    this.fs.deleteSurvey(this.survey.id).then(() => {
      this.router.navigateByUrl('/available');
    },);
  }
}