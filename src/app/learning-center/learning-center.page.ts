import { Component, OnInit } from '@angular/core';
import { LearningModuleService, LearningModule } from '../services/learning-module.service';
import { Observable } from 'rxjs';
import { Storage} from '@ionic/storage';
import { Router } from '@angular/router';


@Component({
  selector: 'app-learning-center',
  templateUrl: './learning-center.page.html',
  styleUrls: ['./learning-center.page.scss'],
})
export class LearningCenterPage implements OnInit {

  private learningModules: Observable<LearningModule[]>;

  constructor(private router: Router, private storage: Storage, private learningModService: LearningModuleService) { }

  ngOnInit() {
    this.storage.get('authenticated').then((val) => {
      if (val === 'false') {
        this.router.navigate(['/login/']);
      }
    });
    this.learningModules = this.learningModService.getAllLearningModules();
  }
}
