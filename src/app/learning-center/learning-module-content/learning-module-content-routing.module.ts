import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LearningModuleContentPage } from './learning-module-content.page';

const routes: Routes = [
  {
    path: '',
    component: LearningModuleContentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LearningModuleContentPageRoutingModule {}
