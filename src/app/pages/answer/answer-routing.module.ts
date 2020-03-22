import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AnswerPage } from './answer.page';

const routes: Routes = [
  {
    path: '',
    component: AnswerPage
  },
  // {
  //   path: 'show-message',
  //   loadChildren: () => import('./show-message/show-message.module').then( m => m.ShowMessagePageModule)
  // }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnswerPageRoutingModule {}