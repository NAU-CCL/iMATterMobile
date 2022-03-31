import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { NewReviewPageRoutingModule } from './new-review-routing.module';

import { NewReviewPage } from './new-review.page';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewReviewPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [NewReviewPage]
})
export class NewReviewPageModule {}
