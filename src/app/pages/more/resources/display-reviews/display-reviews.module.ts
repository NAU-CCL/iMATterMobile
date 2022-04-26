import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DisplayReviewsPageRoutingModule } from './display-reviews-routing.module';

import { DisplayReviewsPage } from './display-reviews.page';
import { CheckForOverflowDirective } from './check-for-overflow.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DisplayReviewsPageRoutingModule
  ],
  declarations: [DisplayReviewsPage, CheckForOverflowDirective]
})
export class DisplayReviewsPageModule {}
