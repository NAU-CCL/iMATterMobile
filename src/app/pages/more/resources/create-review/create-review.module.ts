import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateReviewPageRoutingModule } from './create-review-routing.module';

import { CreateReviewPage } from './create-review.page';
import {DisplayReviewsPage} from '../display-reviews/display-reviews.page'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CreateReviewPageRoutingModule,
  ],
  declarations: [CreateReviewPage]
})
export class CreateReviewPageModule {}
