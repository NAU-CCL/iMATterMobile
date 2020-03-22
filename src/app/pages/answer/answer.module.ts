import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AnswerPageRoutingModule } from './answer-routing.module';

import { AnswerPage } from './answer.page';
import { ShowMessagePageModule } from './show-message/show-message.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShowMessagePageModule,
    AnswerPageRoutingModule
  ],
  declarations: [AnswerPage]
})
export class AnswerPageModule {}
