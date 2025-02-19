import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LearningCenterPageRoutingModule } from './learning-center-routing.module';

import { LearningCenterPage } from './learning-center.page';

import { environment } from '../../../environments/environment';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LearningCenterPageRoutingModule
  ],
  providers: [
  ],
  declarations: [LearningCenterPage]
})
export class LearningCenterPageModule {}
