import { Component, OnInit } from '@angular/core';
import { FireService, Survey } from 'src/app/services/survey/fire.service';
import { ActivatedRoute } from '@angular/router';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';


@Component({
  selector: 'app-answer',
  templateUrl: './answer.page.html',
  styleUrls: ['./answer.page.scss'],
})
export class AnswerPage implements OnInit {
  survey: Survey = {
    title: '',
    startTime: '',
    endTime: '',
    surveyLink: ''
  }
  constructor(private activatedRoute: ActivatedRoute, 
              private fs: FireService,
              private browser: InAppBrowser
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
    this.browser.create(url, `_blank`);
    // If it doesn't work just do
    // this.browser.create(this.survey.surveyLink, `_blank`);
  }

}
