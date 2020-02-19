import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LearningCenterPage } from './learning-center.page';

const routes: Routes = [
  {
    path: '',
    component: LearningCenterPage
  },
  {
    path: 'learning-module-content',
    loadChildren: () => import('./learning-module-content/learning-module-content.module').then( m => m.LearningModuleContentPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LearningCenterPageRoutingModule {}
