import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LearningModuleContentPageRoutingModule } from './learning-module-content-routing.module';

import { LearningModuleContentPage } from './learning-module-content.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    LearningModuleContentPageRoutingModule
  ],
  declarations: [LearningModuleContentPage]
})
export class LearningModuleContentPageModule {}
