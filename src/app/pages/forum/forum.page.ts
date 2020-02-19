import { Component, OnInit } from '@angular/core';
import { QuestionService, Question } from 'src/app/services/infoDesk/question.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-forum',
  templateUrl: './forum.page.html',
  styleUrls: ['./forum.page.scss'],
})
export class ForumPage implements OnInit {


  private questions: Observable<Question[]>;

  constructor(private questionService: QuestionService,
              private storage: Storage,
              private router: Router) {
  }

  ngOnInit() {
    this.storage.get('authenticated').then((val) => {
      if (val === 'false') {
        this.router.navigate(['/login/']);
      }
    });
    this.questions = this.questionService.getQuestions();
  }


}
