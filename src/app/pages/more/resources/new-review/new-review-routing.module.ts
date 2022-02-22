import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewReviewPage } from './new-review.page';

const routes: Routes = [
  {
    path: '',
    component: NewReviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewReviewPageRoutingModule {}
