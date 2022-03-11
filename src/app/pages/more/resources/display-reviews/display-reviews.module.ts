import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DisplayReviewsPageRoutingModule } from './display-reviews-routing.module';

import { DisplayReviewsPage } from './display-reviews.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DisplayReviewsPageRoutingModule
  ],
  declarations: [DisplayReviewsPage]
})
export class DisplayReviewsPageModule {}
