import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateReviewPage } from './create-review.page';

const routes: Routes = [
  {
    path: '',
    component: CreateReviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateReviewPageRoutingModule {}
