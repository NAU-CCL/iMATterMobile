import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResourcePageRoutingModule } from './resource-routing.module';

import { ResourcePage } from './resource.page';

import {DisplayReviewsPage} from '../display-reviews/display-reviews.page'

import { ReviewTagPopoverComponent } from './review-tag-popover/review-tag-popover.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResourcePageRoutingModule
  ],
  declarations: [ResourcePage, DisplayReviewsPage, ReviewTagPopoverComponent],
  entryComponents: [ReviewTagPopoverComponent]
})
export class ResourcePageModule {}