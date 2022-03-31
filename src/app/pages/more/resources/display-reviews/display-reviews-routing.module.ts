import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DisplayReviewsPage } from './display-reviews.page';

const routes: Routes = [
  {
    path: '',
    component: DisplayReviewsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DisplayReviewsPageRoutingModule {}
