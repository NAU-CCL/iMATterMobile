import { Component, OnInit } from '@angular/core';
import { LearningModuleService, LearningModule } from '../../services/learning-module.service';
import { Observable } from 'rxjs';
import { Storage} from '@ionic/storage';
import { Router } from '@angular/router';


@Component({
  selector: 'app-learning-center',
  templateUrl: './learning-center.page.html',
  styleUrls: ['./learning-center.page.scss'],
})
export class LearningCenterPage implements OnInit {

   //Weeks Pregnant of user (to display correct modules to them)
   userWeeksPregnant;

  private learningModules: Observable<LearningModule[]>;

  constructor(private router: Router, private storage: Storage, private learningModService: LearningModuleService) { }

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
  }
}